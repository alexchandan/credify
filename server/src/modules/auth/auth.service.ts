// src/modules/auth/auth.service.ts
import mongoose from "mongoose";
import { User, UserRole } from "../../models/user.model.js";
import { CandidateProfile } from "../../models/candidateProfile.model.js";
import { RecruiterProfile } from "../../models/recruiterProfile.model.js";
import { AppError } from "../../utils/AppError.js";
import { generateRawToken, hashToken } from "../../utils/hashToken.js";
import { signAccessToken, signRefreshToken } from "../../utils/tokenUtils.js";
import { logger } from "../../utils/logger.js";

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
  const session = await mongoose.startSession();
  let createdUserId: string;

  try {
    await session.withTransaction(async () => {
      const user = new User({
        email: input.email,
        passwordHash: input.password, // hashed by User's pre('save') hook
        role: input.role,
        emailVerificationTokenHash: hashToken(rawVerificationToken),
        emailVerificationExpires: new Date(
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

  // TODO(Phase 4): replace with a queued email send once the email service exists.
  logger.info(
    { email: input.email, rawVerificationToken },
    "Email verification token generated (stub — no email service yet)",
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
      "Please verify your email before logging in",
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

// ---- Logic for email varification through link ----
export async function verifyEmail(rawToken: string): Promise<void> {
  const tokenHash = hashToken(rawToken);

  const user = await User.findOne({
    emailVerificationTokenHash: tokenHash,
    emailVerificationExpires: { $gt: new Date() },
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
// added to src/modules/auth/auth.service.ts

export async function forgotPassword(email: string): Promise<void> {
  const user = await User.findOne({ email, deletedAt: null });

  // Deliberately silent if no match — the controller returns the same
  // generic success response either way, so this endpoint can never be
  // used to enumerate which emails have accounts.
  if (!user) {
    return;
  }

  const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 hour — shorter than email verification, since a leaked reset link is more sensitive

  const rawResetToken = generateRawToken();
  user.passwordResetTokenHash = hashToken(rawResetToken);
  user.passwordResetTokenExpiry = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
  await user.save();

  // TODO(Phase 4): replace with a queued email send once the email service exists.
  logger.info(
    { email, rawResetToken },
    "Password reset token generated (stub — no email service yet)",
  );
}
