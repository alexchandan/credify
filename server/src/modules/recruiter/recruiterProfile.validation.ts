import { z } from "zod";

// Deliberately excludes companyId/companyRole — those are managed only
// through createCompany() (and, later, a join-company flow), never via
// a general profile update. Letting a recruiter PATCH their own
// companyId would bypass the OWNER/ADMIN/MEMBER assignment logic entirely.
export const updateRecruiterProfileSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(150)
    .trim()
    .optional(),
  title: z.string().trim().max(150).optional(),
});

export type UpdateRecruiterProfileInput = z.infer<
  typeof updateRecruiterProfileSchema
>;
