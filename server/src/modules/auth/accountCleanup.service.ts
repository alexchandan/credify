import mongoose from "mongoose";
import { User, UserRole } from "../../models/user.model.js";
import { CandidateProfile } from "../../models/candidateProfile.model.js";
import { RecruiterProfile } from "../../models/recruiterProfile.model.js";
import { Application } from "../../models/application.model.js";
import { SavedCandidate } from "../../models/savedCandidate.model.js";
import { AIReport } from "../../models/aiReports.model.js";
import { Notification } from "../../models/notification.model.js";
import { Company } from "../../models/company.model.js";
import { Job } from "../../models/job.model.js";
import { storageService } from "../../utils/storageService.js";
import { logger } from "../../utils/logger.js";

export const RECOVERY_PERIOD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Permanently purges a single user and all their associated resources.
 */
export async function purgeSingleUser(
  userId: mongoose.Types.ObjectId | string,
): Promise<void> {
  const userObjectId =
    typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

  const user = await User.findById(userObjectId);
  if (!user) return;

  const session = await mongoose.startSession();

  try {
    let candidateAvatarPublicId: string | undefined;
    let candidateResumePublicId: string | undefined;

    await session.withTransaction(async () => {
      if (user.role === UserRole.CANDIDATE) {
        const candidateProfile = await CandidateProfile.findOne({
          userId: user._id,
        }).session(session);

        if (candidateProfile) {
          candidateAvatarPublicId = candidateProfile.avatarPublicId;
          candidateResumePublicId = candidateProfile.resumePublicId;

          // Delete candidate applications
          await Application.deleteMany(
            { candidateId: candidateProfile._id },
            { session },
          );

          // Delete saved candidate references
          await SavedCandidate.deleteMany(
            { candidateId: candidateProfile._id },
            { session },
          );

          // Delete AI reports for candidate
          await AIReport.deleteMany(
            { candidateId: candidateProfile._id },
            { session },
          );

          // Delete candidate profile
          await CandidateProfile.deleteOne(
            { _id: candidateProfile._id },
            { session },
          );
        }
      } else if (user.role === UserRole.RECRUITER) {
        const recruiterProfile = await RecruiterProfile.findOne({
          userId: user._id,
        }).session(session);

        if (recruiterProfile) {
          // Delete recruiter's saved candidates
          await SavedCandidate.deleteMany(
            { recruiterId: recruiterProfile._id },
            { session },
          );

          // If recruiter owned a company that was soft-deleted
          if (recruiterProfile.companyId) {
            const company = await Company.findById(
              recruiterProfile.companyId,
            ).session(session);

            if (
              company &&
              company.deletedAt &&
              company.createdBy.toString() === recruiterProfile._id.toString()
            ) {
              const otherMembersCount = await RecruiterProfile.countDocuments({
                companyId: company._id,
                _id: { $ne: recruiterProfile._id },
              }).session(session);

              if (otherMembersCount === 0) {
                // Find all jobs under this company
                const companyJobs = await Job.find({
                  companyId: company._id,
                }).session(session);

                const jobIds = companyJobs.map((j) => j._id);
                if (jobIds.length > 0) {
                  await Application.deleteMany(
                    { jobId: { $in: jobIds } },
                    { session },
                  );
                  await AIReport.deleteMany(
                    { jobId: { $in: jobIds } },
                    { session },
                  );
                  await Job.deleteMany({ _id: { $in: jobIds } }, { session });
                }

                await Company.deleteOne({ _id: company._id }, { session });
              }
            }
          }

          // Delete recruiter profile
          await RecruiterProfile.deleteOne(
            { _id: recruiterProfile._id },
            { session },
          );
        }
      }

      // Delete notifications
      await Notification.deleteMany({ userId: user._id }, { session });

      // Delete user account permanently
      await User.deleteOne({ _id: user._id }, { session });
    });

    // Clean up external Cloudinary assets after transaction commits
    if (candidateAvatarPublicId) {
      try {
        await storageService.delete(candidateAvatarPublicId, "image");
      } catch (err) {
        logger.warn(
          { err, publicId: candidateAvatarPublicId },
          "Failed to delete Cloudinary avatar during user purge",
        );
      }
    }
    if (candidateResumePublicId) {
      try {
        await storageService.delete(candidateResumePublicId, "raw");
      } catch (err) {
        logger.warn(
          { err, publicId: candidateResumePublicId },
          "Failed to delete Cloudinary resume during user purge",
        );
      }
    }

    logger.info(
      { userId: user._id.toString(), email: user.email },
      "User account permanently purged after 7-day grace period",
    );
  } finally {
    await session.endSession();
  }
}

/**
 * Sweeps the database for soft-deleted accounts whose 7-day grace period has expired.
 */
export async function purgeExpiredUsers(): Promise<number> {
  const cutoff = new Date(Date.now() - RECOVERY_PERIOD_MS);
  const expiredUsers = await User.find({
    deletedAt: { $ne: null, $lt: cutoff },
  }).select("_id email");

  if (expiredUsers.length === 0) {
    return 0;
  }

  logger.info(
    { count: expiredUsers.length },
    "Starting purge of expired soft-deleted user accounts",
  );

  let purgedCount = 0;
  for (const user of expiredUsers) {
    try {
      await purgeSingleUser(user._id as mongoose.Types.ObjectId);
      purgedCount += 1;
    } catch (err) {
      logger.error(
        { err, userId: user._id.toString() },
        "Error purging expired user account",
      );
    }
  }

  logger.info({ purgedCount }, "Completed purge of expired user accounts");
  return purgedCount;
}

let cleanupTimer: NodeJS.Timeout | null = null;

/**
 * Starts the recurring scheduler to purge soft-deleted users older than 7 days.
 */
export function startAccountCleanupScheduler(
  intervalMs = 60 * 60 * 1000, // run every 1 hour
): void {
  if (cleanupTimer) return;

  // Run initial sweep on startup in background
  void purgeExpiredUsers().catch((err) => {
    logger.error({ err }, "Initial expired account sweep failed");
  });

  cleanupTimer = setInterval(() => {
    void purgeExpiredUsers().catch((err) => {
      logger.error({ err }, "Recurring expired account sweep failed");
    });
  }, intervalMs);

  // Don't prevent Node process from exiting if only this interval is active
  cleanupTimer.unref();

  logger.info(
    { intervalMs },
    "Account permanent cleanup scheduler initialized",
  );
}

export function stopAccountCleanupScheduler(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
    logger.info("Account permanent cleanup scheduler stopped");
  }
}
