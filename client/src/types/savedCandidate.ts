import type { CandidateProfile } from "./candidate";

export interface SavedCandidate {
  _id: string;
  recruiterId: string;
  candidateId: string;
  candidate?: CandidateProfile | null;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaveCandidateInput {
  candidateId: string;
  note?: string;
}

export interface UpdateSavedCandidateInput {
  note?: string;
}

export interface SavedCandidateListResult {
  savedCandidates: SavedCandidate[];
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}
