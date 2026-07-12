import {
  CandidateProfile,
  type ICandidateProfile,
} from "../../models/candidateProfile.model.js";
import { AppError } from "../../utils/AppError.js";
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
