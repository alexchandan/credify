import { z } from "zod";

export const updateRecruiterProfileSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(150),
  title: z.string().trim().max(150).optional(),
});

export type UpdateRecruiterProfileInput = z.infer<
  typeof updateRecruiterProfileSchema
>;
