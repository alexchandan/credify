import { z } from "zod";
import { UserRole } from "../../models/user.model.js";
import { JobStatus } from "../../models/job.model.js";

export const userListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  role: z.enum(Object.values(UserRole) as [UserRole, ...UserRole[]]).optional(),
});

export type UserListQuery = z.infer<typeof userListQuerySchema>;

export const moderateUserSchema = z.object({
  action: z.enum(["suspend", "reactivate"]),
  reason: z.string().trim().max(500).optional(),
});

export type ModerateUserInput = z.infer<typeof moderateUserSchema>;

export const companyListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CompanyListQuery = z.infer<typeof companyListQuerySchema>;

export const jobListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z
    .enum(Object.values(JobStatus) as [JobStatus, ...JobStatus[]])
    .optional(),
});

export type AdminJobListQuery = z.infer<typeof jobListQuerySchema>;
