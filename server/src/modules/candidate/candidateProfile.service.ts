import {
  CandidateProfile,
  type ICandidateProfile,
} from "../../models/candidateProfile.model.js";
import { AppError } from "../../utils/AppError.js";
import { storageService } from "../../utils/storageService.js";
import { logger } from "../../utils/logger.js";
import type { UpdateCandidateProfileInput } from "./candidateProfile.validation.js";

/**
 * "My profile" is always looked up by userId, never by the profile's own
 * _id — a candidate identifies themself by who they are (req.user.userId),
 * not by a document ID they'd otherwise have to fetch first.
 */
export async function getMyProfile(userId: string): Promise<ICandidateProfile> {
  const profile = await CandidateProfile.findOne({ userId, deletedAt: null });

  if (!profile) {
    throw new AppError(404, "CANDIDATE_404", "Candidate profile not found");
  }

  return profile;
}

export async function updateMyProfile(
  userId: string,
  input: UpdateCandidateProfileInput,
): Promise<ICandidateProfile> {
  const updated = await CandidateProfile.findOneAndUpdate(
    { userId, deletedAt: null },
    { $set: input },
    { new: true, runValidators: true },
  );

  if (!updated) {
    throw new AppError(404, "CANDIDATE_404", "Candidate profile not found");
  }

  return updated;
}

/**
 * Recruiter-facing read of a specific candidate. Explicitly filters
 * deletedAt: null in the query itself — a soft-deleted candidate must be
 * invisible here, not just hidden by a UI-level check.
 */
export async function getCandidateById(
  candidateProfileId: string,
): Promise<ICandidateProfile> {
  const profile = await CandidateProfile.findOne({
    _id: candidateProfileId,
    deletedAt: null,
  });

  if (!profile) {
    throw new AppError(404, "CANDIDATE_404", "Candidate profile not found");
  }

  return profile;
}

/**
 * Uploads a new resume, replacing the old one. If a previous resume
 * exists, its Cloudinary file is deleted AFTER the new upload succeeds
 * (not before) — if the new upload failed, the candidate should still
 * have their old resume rather than ending up with neither.
 */
export async function uploadResume(
  userId: string,
  fileBuffer: Buffer,
): Promise<ICandidateProfile> {
  const profile = await CandidateProfile.findOne({ userId, deletedAt: null });
  if (!profile) {
    throw new AppError(404, "CANDIDATE_404", "Candidate profile not found");
  }

  const previousPublicId = profile.resumePublicId;

  const result = await storageService.upload(fileBuffer, {
    folder: "credify/resumes",
    resourceType: "raw", // PDFs are non-image assets on Cloudinary
  });

  profile.resumeUrl = result.url;
  profile.resumePublicId = result.publicId;
  await profile.save();

  if (previousPublicId) {
    // Best-effort cleanup — if this fails, an orphaned file on Cloudinary
    // is a minor cost, not worth failing the whole request over (the
    // profile is already correctly updated at this point).
    try {
      await storageService.delete(previousPublicId, "raw");
    } catch (err) {
      // Deliberately swallowed — see comment above. Logged (not silent)
      // so an orphaned Cloudinary file is at least visible for periodic
      // manual cleanup.
      logger.warn(
        { err, previousPublicId },
        "Failed to delete previous resume from storage",
      );
    }
  }

  return profile;
}
