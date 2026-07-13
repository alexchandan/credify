import { User, type IUser } from "../../models/user.model.js";
import { Company, type ICompany } from "../../models/company.model.js";
import { Job, type IJob } from "../../models/job.model.js";
import {
  ActivityLog,
  ActivityAction,
  ActivityTargetType,
} from "../../models/activityLog.model.js";
import { AppError } from "../../utils/AppError.js";
import { stripUndefined } from "../../utils/stripUndefined.js";
import type {
  UserListQuery,
  ModerateUserInput,
  CompanyListQuery,
  AdminJobListQuery,
} from "./admin.validation.js";

interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export async function listUsers(
  query: UserListQuery,
): Promise<PaginatedResult<IUser>> {
  const filter: Record<string, unknown> = {};
  if (query.role) filter.role = query.role;

  const skip = (query.page - 1) * query.limit;
  const [items, totalCount] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit),
    User.countDocuments(filter),
  ]);

  return {
    items,
    page: query.page,
    limit: query.limit,
    totalCount,
    totalPages: Math.ceil(totalCount / query.limit),
  };
}

/**
 * Suspending bumps tokenVersion — consistent with the same reasoning as
 * password reset in the auth module: a suspended account's existing
 * sessions must die immediately, not just block future logins.
 */
export async function moderateUser(
  actorUserId: string,
  targetUserId: string,
  input: ModerateUserInput,
): Promise<IUser> {
  const user = await User.findById(targetUserId);
  if (!user) {
    throw new AppError(404, "USER_404", "User not found");
  }

  if (input.action === "suspend") {
    user.deletedAt = new Date();
    user.tokenVersion += 1;
  } else {
    user.deletedAt = null;
  }
  await user.save();

  await ActivityLog.create({
    actorId: actorUserId,
    action: ActivityAction.USER_MODERATED,
    targetType: ActivityTargetType.USER,
    targetId: user._id,
    ...stripUndefined({
      metadata: { action: input.action, reason: input.reason },
    }),
  });

  return user;
}

export async function listCompanies(
  query: CompanyListQuery,
): Promise<PaginatedResult<ICompany>> {
  const skip = (query.page - 1) * query.limit;
  const filter = { deletedAt: null };

  const [items, totalCount] = await Promise.all([
    Company.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit),
    Company.countDocuments(filter),
  ]);

  return {
    items,
    page: query.page,
    limit: query.limit,
    totalCount,
    totalPages: Math.ceil(totalCount / query.limit),
  };
}

/**
 * KNOWN LIMITATION: this does NOT cascade to the company's jobs — a job
 * at a deleted company remains isDeleted: false and will still appear in
 * public listings/search, even though its company no longer "exists"
 * (soft-deleted). A real cascade (auto-close jobs? notify recruiters?)
 * is a genuine design decision of its own, not something to bolt on
 * silently here. Flagging this explicitly rather than building a partial
 * cascade that looks complete but isn't.
 */
export async function deleteCompany(
  actorUserId: string,
  companyId: string,
): Promise<void> {
  const company = await Company.findOne({ _id: companyId, deletedAt: null });
  if (!company) {
    throw new AppError(404, "COMPANY_404", "Company not found");
  }

  company.deletedAt = new Date();
  await company.save();

  await ActivityLog.create({
    actorId: actorUserId,
    action: ActivityAction.COMPANY_DELETED,
    targetType: ActivityTargetType.COMPANY,
    targetId: company._id,
  });
}

export async function listJobs(
  query: AdminJobListQuery,
): Promise<PaginatedResult<IJob>> {
  const filter: Record<string, unknown> = { isDeleted: false };
  if (query.status) filter.status = query.status;

  const skip = (query.page - 1) * query.limit;
  const [items, totalCount] = await Promise.all([
    Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit),
    Job.countDocuments(filter),
  ]);

  return {
    items,
    page: query.page,
    limit: query.limit,
    totalCount,
    totalPages: Math.ceil(totalCount / query.limit),
  };
}

export async function deleteJob(
  actorUserId: string,
  jobId: string,
): Promise<void> {
  const job = await Job.findOne({ _id: jobId, isDeleted: false });
  if (!job) {
    throw new AppError(404, "JOB_404", "Job not found");
  }

  job.isDeleted = true;
  job.deletedAt = new Date();
  await job.save();

  await ActivityLog.create({
    actorId: actorUserId,
    action: ActivityAction.JOB_DELETED,
    targetType: ActivityTargetType.JOB,
    targetId: job._id,
  });
}
