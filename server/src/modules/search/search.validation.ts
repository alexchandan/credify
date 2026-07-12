import { z } from "zod";
import { Availability } from "../../models/candidateProfile.model.js";
import { EmploymentType, ExperienceLevel } from "../../models/job.model.js";

export const searchCandidatesQuerySchema = z.object({
  q: z.string().trim().min(1, "A search query is required"),
  location: z.string().trim().optional(),
  availability: z
    .enum(Object.values(Availability) as [Availability, ...Availability[]])
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type SearchCandidatesQuery = z.infer<typeof searchCandidatesQuerySchema>;

export const searchJobsQuerySchema = z.object({
  q: z.string().trim().min(1, "A search query is required"),
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
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type SearchJobsQuery = z.infer<typeof searchJobsQuerySchema>;
