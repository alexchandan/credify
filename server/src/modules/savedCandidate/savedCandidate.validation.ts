import { z } from "zod";

export const saveCandidateSchema = z.object({
  candidateId: z.string().min(1, "candidateId is required"),
  note: z.string().trim().max(1000).optional(),
});

export type SaveCandidateInput = z.infer<typeof saveCandidateSchema>;

export const updateSavedCandidateSchema = z.object({
  note: z.string().trim().max(1000).optional(),
});

export type UpdateSavedCandidateInput = z.infer<
  typeof updateSavedCandidateSchema
>;

export const savedCandidateListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type SavedCandidateListQuery = z.infer<
  typeof savedCandidateListQuerySchema
>;
