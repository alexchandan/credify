import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { User, UserRole, type IUser } from "../../models/user.model.js";
import { CandidateProfile } from "../../models/candidateProfile.model.js";
import { RecruiterProfile } from "../../models/recruiterProfile.model.js";
import { Company } from "../../models/company.model.js";
import { AppError } from "../../utils/AppError.js";
import { generateRawToken, hashToken } from "../../utils/hashToken.js";
import { env } from "../../config/env.js";
import { emailService, sendEmailSafely } from "../../utils/emailService.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/tokenUtils.js";
import {
  RECOVERY_PERIOD_MS,
  purgeSingleUser,
} from "./accountCleanup.service.js";
import type { RecoverAccountInput } from "./auth.validation.js";

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

interface AuthUserResult {
  id: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  fullName?: string;
  avatarUrl?: string;
}

interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: AuthUserResult;
}

async function getAuthUser(user: IUser): Promise<AuthUserResult> {
  const base = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  };

  if (user.role === UserRole.CANDIDATE) {
    const profile = await CandidateProfile.findOne({
      userId: user._id,
      deletedAt: null,
    })
      .select("fullName avatarUrl")
      .lean();

    return {
      ...base,
      ...(profile?.fullName ? { fullName: profile.fullName } : {}),
      ...(profile?.avatarUrl ? { avatarUrl: profile.avatarUrl } : {}),
    };
  }

  if (user.role === UserRole.RECRUITER) {
    const profile = await RecruiterProfile.findOne({
      userId: user._id,
      deletedAt: null,
    })
      .select("fullName")
      .lean();
    return {
      ...base,
      ...(profile?.fullName ? { fullName: profile.fullName } : {}),
    };
  }

  return base;
}

// ---- Register function ----
export async function register(
  input: RegisterInput,
): Promise<{ userId: string }> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    if (existing.deletedAt === null) {
      throw new AppError(
        409,
        "USER_ALREADY_EXISTS",
        "An account with this email already exists",
      );
    }

    const elapsed = Date.now() - existing.deletedAt.getTime();
    if (elapsed <= RECOVERY_PERIOD_MS) {
      const daysRemaining = Math.max(
        1,
        Math.ceil((RECOVERY_PERIOD_MS - elapsed) / (1000 * 60 * 60 * 24)),
      );
      throw new AppError(
        409,
        "ACCOUNT_PENDING_DELETION",
        `This email belongs to an account currently in recovery period (${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left). Please recover your account instead of creating a new one.`,
        [{ email: existing.email, daysRemaining }],
      );
    } else {
      // 7-day grace period has passed; purge the old record so registration can proceed
      await purgeSingleUser(existing._id);
    }
  }

  const rawVerificationToken = generateRawToken();
  const session = await mongoose.startSession(); // session to provide ACID transaction
  let createdUserId: string;

  try {
    await session.withTransaction(async () => {
      const user = new User({
        email: normalizedEmail,
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

  // Check if account was soft-deleted
  if (user.deletedAt !== null) {
    const elapsed = Date.now() - user.deletedAt.getTime();
    if (elapsed > RECOVERY_PERIOD_MS) {
      // 7-day recovery period expired — purge lazily and reject login
      void purgeSingleUser(user._id).catch(() => {});
      throw new AppError(
        401,
        "AUTH_INVALID_CREDENTIALS",
        "Invalid email or password",
      );
    }

    const scheduledPermanentDeletion = new Date(
      user.deletedAt.getTime() + RECOVERY_PERIOD_MS,
    );
    const daysRemaining = Math.max(
      1,
      Math.ceil(
        (scheduledPermanentDeletion.getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      ),
    );

    throw new AppError(
      403,
      "ACCOUNT_SCHEDULED_FOR_DELETION",
      `Your account is deactivated and scheduled for permanent deletion on ${scheduledPermanentDeletion.toLocaleDateString()}. You have ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left to recover it.`,
      [
        {
          email: user.email,
          deletedAt: user.deletedAt.toISOString(),
          scheduledPermanentDeletion: scheduledPermanentDeletion.toISOString(),
          daysRemaining,
        },
      ],
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
    user: await getAuthUser(user),
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
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  // Deliberately silent if no match — to avoid email enumeration
  if (!user) {
    return;
  }

  // If user was soft-deleted, check if within 7-day grace period
  if (user.deletedAt !== null) {
    const elapsed = Date.now() - user.deletedAt.getTime();
    if (elapsed > RECOVERY_PERIOD_MS) {
      void purgeSingleUser(user._id).catch(() => {});
      return;
    }
  }

  const PASSWORD_RESET_TTL_MS = 30 * 60 * 1000; // 30 minutes — shorter than email verification, since a leaked reset link is more sensitive

  const rawResetToken = generateRawToken();
  user.passwordResetTokenHash = hashToken(rawResetToken);
  user.passwordResetTokenExpiry = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
  await user.save();

  const resetUrl = `${env.clientOrigins[0]}/reset-password?token=${rawResetToken}`;
  await sendEmailSafely(() =>
    emailService.sendPasswordResetEmail(normalizedEmail, resetUrl),
  );
}

// ---- Reset Password (consumes the token from forgotPassword) ----
export async function resetPassword(
  rawToken: string,
  newPassword: string,
): Promise<{ accountRecovered: boolean }> {
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

  let accountRecovered = false;

  if (user.deletedAt !== null) {
    const elapsed = Date.now() - user.deletedAt.getTime();
    if (elapsed > RECOVERY_PERIOD_MS) {
      void purgeSingleUser(user._id).catch(() => {});
      throw new AppError(
        410,
        "ACCOUNT_DELETION_EXPIRED",
        "The 7-day recovery period for this account has expired. The account cannot be recovered.",
      );
    }

    // Resetting password for an account in recovery grace period automatically restores the account
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        user.deletedAt = null;
        user.passwordHash = newPassword;
        user.passwordResetTokenHash = undefined;
        user.passwordResetTokenExpiry = undefined;
        user.tokenVersion += 1;
        await user.save({ session });

        if (user.role === UserRole.CANDIDATE) {
          await CandidateProfile.updateOne(
            { userId: user._id },
            { $set: { deletedAt: null } },
            { session },
          );
        } else if (user.role === UserRole.RECRUITER) {
          await RecruiterProfile.updateOne(
            { userId: user._id },
            { $set: { deletedAt: null } },
            { session },
          );

          const recruiterProfile = await RecruiterProfile.findOne({
            userId: user._id,
          }).session(session);

          if (recruiterProfile?.companyId) {
            await Company.updateOne(
              {
                _id: recruiterProfile.companyId,
                createdBy: recruiterProfile._id,
              },
              { $set: { deletedAt: null } },
              { session },
            );
          }
        }
      });
      accountRecovered = true;
    } finally {
      await session.endSession();
    }
  } else {
    user.passwordHash = newPassword; // rehashed by User's pre('save') hook
    user.passwordResetTokenHash = undefined;
    user.passwordResetTokenExpiry = undefined;
    user.tokenVersion += 1; // password changed — invalidate every existing session
    await user.save();
  }

  return { accountRecovered };
}

/**
 * Supports frontend session restoration: after a silent POST /auth/refresh
 * on page load, the frontend has a valid access token but no idea WHO the
 * user is (refresh only ever returns a new token, never identity).
 */
export async function getMe(userId: string): Promise<AuthUserResult> {
  const user = await User.findOne({ _id: userId, deletedAt: null });
  if (!user) {
    throw new AppError(404, "USER_404", "User not found");
  }

  return getAuthUser(user);
}

// ---- Self serviced change password changed while logged In
export async function changePassword(
  userId: string,
  currentPassowrd: string,
  newPassword: string,
): Promise<LoginResult> {
  const user = await User.findOne({ _id: userId, deletedAt: null }).select(
    "+passwordHash",
  );
  if (!user) {
    throw new AppError(404, "USER_404", "User not found");
  }

  const isCurrentPasswordValid = await user.comparePassword(currentPassowrd);
  if (!isCurrentPasswordValid) {
    throw new AppError(
      401,
      "AUTH_INVALID_CREDENTIALS",
      "Current passoword is invalid",
    );
  }

  user.passwordHash = newPassword;
  user.tokenVersion += 1;

  await user.save();

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
    user: await getAuthUser(user),
  };
}

// ---- Self serviced account deletion (7-day soft delete) ----
export async function deleteAccount(
  userId: string,
  password: string,
): Promise<{ scheduledPermanentDeletion: Date; daysRemaining: number }> {
  const user = await User.findOne({ _id: userId, deletedAt: null }).select(
    "+passwordHash",
  );

  if (!user) {
    throw new AppError(404, "USER_404", "User not found");
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError(401, "AUTH_INVALID_CREDENTIALS", "Incorrect password");
  }

  const deletionTimestamp = new Date();
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      user.deletedAt = deletionTimestamp;
      user.tokenVersion += 1;
      await user.save({ session });

      if (user.role === UserRole.CANDIDATE) {
        await CandidateProfile.updateOne(
          { userId: user._id },
          { $set: { deletedAt: deletionTimestamp } },
          { session },
        );
      } else if (user.role === UserRole.RECRUITER) {
        const recruiterProfile = await RecruiterProfile.findOne({
          userId: user._id,
        }).session(session);

        if (recruiterProfile) {
          recruiterProfile.deletedAt = deletionTimestamp;
          await recruiterProfile.save({ session });

          // If recruiter is owner of a company with no other active members, soft-delete company
          if (recruiterProfile.companyId) {
            const otherMembersCount = await RecruiterProfile.countDocuments({
              companyId: recruiterProfile.companyId,
              _id: { $ne: recruiterProfile._id },
              deletedAt: null,
            }).session(session);

            if (otherMembersCount === 0) {
              await Company.updateOne(
                { _id: recruiterProfile.companyId },
                { $set: { deletedAt: deletionTimestamp } },
                { session },
              );
            }
          }
        }
      }
    });
  } finally {
    await session.endSession();
  }

  const scheduledPermanentDeletion = new Date(
    deletionTimestamp.getTime() + RECOVERY_PERIOD_MS,
  );

  return {
    scheduledPermanentDeletion,
    daysRemaining: 7,
  };
}

// ---- Recover Soft-Deleted Account within 7 Days ----
export async function recoverAccount(
  input: RecoverAccountInput,
): Promise<LoginResult> {
  const user = await User.findOne({
    email: input.email,
  }).select("+passwordHash");

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

  if (user.deletedAt === null) {
    throw new AppError(
      400,
      "ACCOUNT_ALREADY_ACTIVE",
      "Your account is already active. Please sign in directly.",
    );
  }

  const elapsed = Date.now() - user.deletedAt.getTime();
  if (elapsed > RECOVERY_PERIOD_MS) {
    void purgeSingleUser(user._id).catch(() => {});
    throw new AppError(
      410,
      "ACCOUNT_DELETION_EXPIRED",
      "The 7-day recovery grace period for this account has expired. The account has been permanently deleted.",
    );
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      user.deletedAt = null;
      user.tokenVersion += 1;
      await user.save({ session });

      if (user.role === UserRole.CANDIDATE) {
        await CandidateProfile.updateOne(
          { userId: user._id },
          { $set: { deletedAt: null } },
          { session },
        );
      } else if (user.role === UserRole.RECRUITER) {
        await RecruiterProfile.updateOne(
          { userId: user._id },
          { $set: { deletedAt: null } },
          { session },
        );

        // If recruiter profile has a soft-deleted company that was created by them, restore it
        const recruiterProfile = await RecruiterProfile.findOne({
          userId: user._id,
        }).session(session);

        if (recruiterProfile?.companyId) {
          await Company.updateOne(
            {
              _id: recruiterProfile.companyId,
              createdBy: recruiterProfile._id,
            },
            { $set: { deletedAt: null } },
            { session },
          );
        }
      }
    });
  } finally {
    await session.endSession();
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
    user: await getAuthUser(user),
  };
}
