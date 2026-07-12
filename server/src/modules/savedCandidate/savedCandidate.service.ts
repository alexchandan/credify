import {
  SavedCandidate,
  type ISavedCandidate,
} from "../../models/savedCandidate.model.js";
import { CandidateProfile } from "../../models/candidateProfile.model.js";
import { RecruiterProfile } from "../../models/recruiterProfile.model.js";
import { AppError } from "../../utils/AppError.js";
import { isDuplicateKeyErrorOnField } from "../../utils/mongoErrors.js";
import { stripUndefined } from "../../utils/stripUndefined.js";
import type {
  SaveCandidateInput,
  UpdateSavedCandidateInput,
  SavedCandidateListQuery,
} from "./savedCandidate.validation.js";

async function getActorRecruiter(actorUserId: string) {
  const recruiter = await RecruiterProfile.findOne({
    userId: actorUserId,
    deletedAt: null,
  });
  if (!recruiter) {
    throw new AppError(404, "RECRUITER_404", "Recruiter profile not found");
  }
  return recruiter;
}

export async function saveCandidate(
  actorUserId: string,
  input: SaveCandidateInput,
): Promise<ISavedCandidate> {
  const recruiter = await getActorRecruiter(actorUserId);

  const candidate = await CandidateProfile.findOne({
    _id: input.candidateId,
    deletedAt: null,
  });
  if (!candidate) {
    throw new AppError(404, "CANDIDATE_404", "Candidate profile not found");
  }

  // Fast-path pre-check only — same pattern/caveat as every other unique
  // constraint in this project (see ensureUniqueSlug in company.service.ts).
  const existing = await SavedCandidate.findOne({
    recruiterId: recruiter._id,
    candidateId: candidate._id,
  });
  if (existing) {
    throw new AppError(
      409,
      "CANDIDATE_ALREADY_SAVED",
      "You have already saved this candidate",
    );
  }

  try {
    const saved = await SavedCandidate.create({
      recruiterId: recruiter._id,
      candidateId: candidate._id,
      ...stripUndefined({ note: input.note }),
    });
    return saved;
  } catch (err) {
    if (isDuplicateKeyErrorOnField(err, "candidateId")) {
      throw new AppError(
        409,
        "CANDIDATE_ALREADY_SAVED",
        "You have already saved this candidate",
      );
    }
    throw err;
  }
}

interface SavedCandidateListResult {
  savedCandidates: ISavedCandidate[];
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export async function getMySavedCandidates(
  actorUserId: string,
  query: SavedCandidateListQuery,
): Promise<SavedCandidateListResult> {
  const recruiter = await getActorRecruiter(actorUserId);

  const skip = (query.page - 1) * query.limit;
  const filter = { recruiterId: recruiter._id };

  const [savedCandidates, totalCount] = await Promise.all([
    SavedCandidate.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit),
    SavedCandidate.countDocuments(filter),
  ]);

  return {
    savedCandidates,
    page: query.page,
    limit: query.limit,
    totalCount,
    totalPages: Math.ceil(totalCount / query.limit),
  };
}

/**
 * Ownership is a direct equality check here, not a policies/ function —
 * SavedCandidate is personal to the recruiter who created it (ADR-008,
 * no company-wide sharing), so "can manage" reduces to "is the owner",
 * with no company/role nuance the way Job or Application have.
 */
async function getOwnedSavedCandidate(
  actorUserId: string,
  savedCandidateId: string,
): Promise<ISavedCandidate> {
  const recruiter = await getActorRecruiter(actorUserId);

  const saved = await SavedCandidate.findById(savedCandidateId);
  if (!saved) {
    throw new AppError(
      404,
      "SAVED_CANDIDATE_404",
      "Saved candidate record not found",
    );
  }
  if (!saved.recruiterId.equals(recruiter._id as never)) {
    throw new AppError(
      403,
      "AUTH_FORBIDDEN",
      "You did not save this candidate",
    );
  }

  return saved;
}

export async function updateSavedCandidate(
  actorUserId: string,
  savedCandidateId: string,
  input: UpdateSavedCandidateInput,
): Promise<ISavedCandidate> {
  const saved = await getOwnedSavedCandidate(actorUserId, savedCandidateId);

  if (input.note !== undefined) {
    saved.note = input.note;
  }
  await saved.save();

  return saved;
}

export async function unsaveCandidate(
  actorUserId: string,
  savedCandidateId: string,
): Promise<void> {
  const saved = await getOwnedSavedCandidate(actorUserId, savedCandidateId);
  await saved.deleteOne();
}
