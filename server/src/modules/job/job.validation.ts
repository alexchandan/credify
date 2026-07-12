import { z } from "zod";
import { EmploymentType, ExperienceLevel } from "../../models/job.model.js";

const salaryRangeSchema = z
  .object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional(),
    currency: z.string().trim().optional(),
  })
  .refine(
    (val) =>
      val.min === undefined || val.max === undefined || val.min <= val.max,
    {
      message: "min must be less than or equal to max",
      path: ["min"],
    },
  );

export const createJobSchema = z.object({
  title: z.string().min(1, "Job title is required").max(150).trim(),
  description: z
    .string()
    .min(1, "Job description is required")
    .max(1000)
    .trim(),
  employmentType: z.enum(
    Object.values(EmploymentType) as [EmploymentType, ...EmploymentType[]],
  ),
  experienceLevel: z.enum(
    Object.values(ExperienceLevel) as [ExperienceLevel, ...ExperienceLevel[]],
  ),
  skillsRequired: z.array(z.string().trim().min(1)).default([]),
  location: z.array(z.string().trim().min(1)).default([]),
  isRemote: z.boolean().default(false),
  salaryRange: salaryRangeSchema.optional(),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;

// Status is deliberately excluded — publish/close are their own endpoints
// with their own side effects (publishedAt stamping, "stop accepting
// applications" semantics), not an incidental field on a generic edit.
export const updateJobSchema = createJobSchema.partial();

export type UpdateJobInput = z.infer<typeof updateJobSchema>;

export const jobListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  skill: z.string().trim().optional(),
  location: z.string().trim().optional(),
  employmentType: z
    .enum(
      Object.values(EmploymentType) as [EmploymentType, ...EmploymentType[]],
    )
    .optional(),
  experienceLevel: z
    .enum(
      Object.values(ExperienceLevel) as [ExperienceLevel, ...ExperienceLevel[]],
    )
    .optional(),
  isRemote: z.coerce.boolean().optional(),
  companyId: z.string().trim().optional(),
});

export type JobListQuery = z.infer<typeof jobListQuerySchema>;
