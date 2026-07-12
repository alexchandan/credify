import { z } from "zod";
import { ApplicationStatus } from "../../models/application.model.js";

export const applyToJobSchema = z.object({
  jobId: z.string().min(1, "jobId is required"),
  coverLetter: z.string().trim().max(3000).optional(),
});

export type ApplyToJobInput = z.infer<typeof applyToJobSchema>;

// Validates the shape only (must be a real ApplicationStatus value) — WHICH
// transitions are actually allowed depends on whether the actor is the
// candidate or a recruiter, and is enforced in application.service.ts,
// not here (see canUpdateApplicationStatus's own doc comment on this).
export const updateApplicationStatusSchema = z.object({
  status: z.enum(
    Object.values(ApplicationStatus) as [
      ApplicationStatus,
      ...ApplicationStatus[],
    ],
  ),
});

export type UpdateApplicationStatusInput = z.infer<
  typeof updateApplicationStatusSchema
>;

export const applicationListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z
    .enum(
      Object.values(ApplicationStatus) as [
        ApplicationStatus,
        ...ApplicationStatus[],
      ],
    )
    .optional(),
});

export type ApplicationListQuery = z.infer<typeof applicationListQuerySchema>;
