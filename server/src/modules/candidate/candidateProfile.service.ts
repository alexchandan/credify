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

// ---- For recruiter ----
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
 * Uploads a new resume, replacing the old one.
 * If a previous resume exists, its Cloudinary file is deleted AFTER the new upload succeeds
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
  profile.resumeUploadedAt = new Date();
  await profile.save();

  if (previousPublicId) {
    // Cleanup - the field in claudinary does not replaced by the old one, it add a completly new file.
    // So you have to delete the previously one
    try {
      await storageService.delete(previousPublicId, "raw");
    } catch (err) {
      logger.warn(
        { err, previousPublicId },
        "Failed to delete previous resume from storage",
      );
    }
  }

  return profile;
}

export async function deleteResume(userId: string): Promise<ICandidateProfile> {
  const profile = await getMyProfile(userId);
  const publicId = profile.resumePublicId;

  if (publicId) {
    await storageService.delete(publicId, "raw");
  }

  profile.set({
    resumeUrl: undefined,
    resumePublicId: undefined,
    resumeUploadedAt: undefined,
  });
  await profile.save();
  return profile;
}

export async function uploadAvatar(
  userId: string,
  fileBuffer: Buffer,
): Promise<ICandidateProfile> {
  const profile = await getMyProfile(userId);
  const previousPublicId = profile.avatarPublicId;

  const result = await storageService.upload(fileBuffer, {
    folder: "credify/avatars",
    resourceType: "image",
  });

  profile.avatarUrl = result.url;
  profile.avatarPublicId = result.publicId;
  profile.avatarUploadedAt = new Date();
  await profile.save();

  if (previousPublicId) {
    try {
      await storageService.delete(previousPublicId, "image");
    } catch (err) {
      logger.warn(
        { err, previousPublicId },
        "Failed to delete previous avatar from storage",
      );
    }
  }

  return profile;
}

export async function deleteAvatar(userId: string): Promise<ICandidateProfile> {
  const profile = await getMyProfile(userId);
  const publicId = profile.avatarPublicId;

  if (publicId) {
    await storageService.delete(publicId, "image");
  }

  profile.set({
    avatarUrl: undefined,
    avatarPublicId: undefined,
    avatarUploadedAt: undefined,
  });
  await profile.save();
  return profile;
}
