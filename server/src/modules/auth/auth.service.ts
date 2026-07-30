import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { User, UserRole } from "../../models/user.model.js";
import { CandidateProfile } from "../../models/candidateProfile.model.js";
import { RecruiterProfile } from "../../models/recruiterProfile.model.js";
import { AppError } from "../../utils/AppError.js";
import { generateRawToken, hashToken } from "../../utils/hashToken.js";
import { env } from "../../config/env.js";
import { emailService, sendEmailSafely } from "../../utils/emailService.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/tokenUtils.js";

const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  role: UserRole.CANDIDATE | UserRole.RECRUITER;
}

interface LoginInput {
  email: string;
  password: string;
}

interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}

// ---- Register function ----
export async function register(
  input: RegisterInput,
): Promise<{ userId: string }> {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw new AppError(
      409,
      "USER_ALREADY_EXISTS",
      "An account with this email already exists",
    );
  }

  const rawVerificationToken = generateRawToken();
  const session = await mongoose.startSession(); // session to provide ACID transaction
  let createdUserId: string;

  try {
    await session.withTransaction(async () => {
      const user = new User({
        email: input.email,
        passwordHash: input.password, // hashed by User's pre('save') hook
        role: input.role,
        emailVerificationTokenHash: hashToken(rawVerificationToken),
        emailVerificationTokenExpiry: new Date(
          Date.now() + EMAIL_VERIFICATION_TTL_MS,
        ),
      });

      await user.save({ session });

      if (input.role === UserRole.CANDIDATE) {
        await CandidateProfile.create(
          [{ userId: user._id, fullName: input.fullName }],
          { session },
        );
      } else {
        await RecruiterProfile.create(
          [{ userId: user._id, fullName: input.fullName }],
          { session },
        );
      }

      createdUserId = user._id.toString();
    });
  } finally {
    await session.endSession();
  }

  // Sent after the transaction commits — email delivery is not a DB
  // operation and shouldn't share the transaction's scope/session.
  const verificationUrl = `${env.clientOrigins[0]}/verify-email?token=${rawVerificationToken}`;
  await sendEmailSafely(() =>
    emailService.sendVerificationEmail(input.email, verificationUrl),
  );

  return { userId: createdUserId! };
}

// ---- Login function ----
export async function login(input: LoginInput): Promise<LoginResult> {
  const user = await User.findOne({
    email: input.email,
    deletedAt: null,
  }).select("+passwordHash");

  // Same generic error whether the user doesn't exist or the password is
  // wrong — never reveal which one it was, to avoid email enumeration.

  if (!user) {
    throw new AppError(
      401,
      "AUTH_INVALID_CREDENTIALS",
      "Invalid email or password",
    );
  }

  const isPasswordValid = await user.comparePassword(input.password);
  if (!isPasswordValid) {
    throw new AppError(
      401,
      "AUTH_INVALID_CREDENTIALS",
      "Invalid email or password",
    );
  }

  if (!user.isVerified) {
    throw new AppError(
      403,
      "AUTH_EMAIL_NOT_VERIFIED",
      "Please verify your email from Inbox before logging in",
    );
  }

  const accessToken = signAccessToken({
    userId: user._id.toString(),
    role: user.role,
  });
  const refreshToken = signRefreshToken({
    userId: user._id.toString(),
    tokenVersion: user.tokenVersion,
  });

  return {
    accessToken,
    refreshToken,
    user: { id: user._id.toString(), email: user.email, role: user.role },
  };
}

// ---- Logout From Everywhere ----
export async function logoutEverywhere(userId: string): Promise<void> {
  await User.updateOne({ _id: userId }, { $inc: { tokenVersion: 1 } });
}

// ---- Refresh Tokens (rotates access + refresh token pair) ----
interface RefreshResult {
  accessToken: string;
  refreshToken: string;
}

export async function refreshTokens(
  rawRefreshToken: string,
): Promise<RefreshResult> {
  let payload;
  try {
    payload = verifyRefreshToken(rawRefreshToken);
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError(
        401,
        "AUTH_TOKEN_EXPIRED",
        "Refresh token has expired. Please log in again.",
      );
    }
    throw new AppError(401, "AUTH_TOKEN_INVALID", "Invalid refresh token");
  }

  const user = await User.findOne({ _id: payload.userId, deletedAt: null });
  if (!user) {
    throw new AppError(401, "AUTH_TOKEN_INVALID", "Invalid refresh token");
  }

  // Mismatch means this token was issued before a "logout everywhere" event
  // (tokenVersion was bumped since) — reject even though it hasn't expired.
  if (user.tokenVersion !== payload.tokenVersion) {
    throw new AppError(
      401,
      "AUTH_TOKEN_INVALID",
      "This session has been revoked. Please log in again.",
    );
  }

  const accessToken = signAccessToken({
    userId: user._id.toString(),
    role: user.role,
  });
  const refreshToken = signRefreshToken({
    userId: user._id.toString(),
    tokenVersion: user.tokenVersion,
  });

  // NOTE: this rotates to a new token pair but does not blacklist the
  // specific refresh token just used — true single-use reuse detection
  // requires a persisted token store (planned for Phase 4 via Redis).
  return { accessToken, refreshToken };
}

// ---- Send verification Email through resend ----
export async function resendVerificationEmail(email: string): Promise<void> {
  const user = await User.findOne({ email, deletedAt: null });
  if (!user || user.isVerified) {
    return;
  }

  const rawVerificationToken = generateRawToken();
  user.emailVerificationTokenHash = hashToken(rawVerificationToken);
  user.emailVerificationTokenExpiry = new Date(
    Date.now() + EMAIL_VERIFICATION_TTL_MS,
  );
  await user.save();

  const verificationUrl = `${env.clientOrigins[0]}/verify-email?token=${rawVerificationToken}`;
  await sendEmailSafely(() =>
    emailService.sendVerificationEmail(email, verificationUrl),
  );
  console.log(`email sent to ${email} `);
}

// ---- Logic for email varification through link ----
export async function verifyEmail(rawToken: string): Promise<void> {
  const tokenHash = hashToken(rawToken);

  const user = await User.findOne({
    emailVerificationTokenHash: tokenHash,
    emailVerificationTokenExpiry: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError(
      400,
      "AUTH_TOKEN_INVALID",
      "Invalid or expired verification token",
    );
  }

  user.isVerified = true;
  user.emailVerificationTokenHash = undefined;
  user.emailVerificationTokenExpiry = undefined;
  await user.save();
}

// ---- Password reset through link send on email ----
export async function forgotPassword(email: string): Promise<void> {
  const user = await User.findOne({ email, deletedAt: null });

  // Deliberately silent if no match — to avoid email enumeration
  if (!user) {
    return;
  }

  const PASSWORD_RESET_TTL_MS = 30 * 60 * 1000; // 30 minutes — shorter than email verification, since a leaked reset link is more sensitive

  const rawResetToken = generateRawToken();
  user.passwordResetTokenHash = hashToken(rawResetToken);
  user.passwordResetTokenExpiry = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
  await user.save();

  const resetUrl = `${env.clientOrigins[0]}/reset-password?token=${rawResetToken}`;
  await sendEmailSafely(() =>
    emailService.sendPasswordResetEmail(email, resetUrl),
  );
}

// ---- Reset Password (consumes the token from forgotPassword) ----
export async function resetPassword(
  rawToken: string,
  newPassword: string,
): Promise<void> {
  const tokenHash = hashToken(rawToken);

  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetTokenExpiry: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError(
      400,
      "AUTH_TOKEN_INVALID",
      "Invalid or expired reset token",
    );
  }

  user.passwordHash = newPassword; // rehashed by User's pre('save') hook
  user.passwordResetTokenHash = undefined;
  user.passwordResetTokenExpiry = undefined;
  user.tokenVersion += 1; // password changed — invalidate every existing session
  await user.save();
}

interface MeResult {
  id: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
}

/**
 * Supports frontend session restoration: after a silent POST /auth/refresh
 * on page load, the frontend has a valid access token but no idea WHO the
 * user is (refresh only ever returns a new token, never identity).
 */
export async function getMe(userId: string): Promise<MeResult> {
  const user = await User.findOne({ _id: userId, deletedAt: null });
  if (!user) {
    throw new AppError(404, "USER_404", "User not found");
  }

  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  };
}
