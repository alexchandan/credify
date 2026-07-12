import { Job, JobStatus, type IJob } from "../../models/job.model.js";
import { RecruiterProfile } from "../../models/recruiterProfile.model.js";
import { AppError } from "../../utils/AppError.js";
import { stripUndefined } from "../../utils/stripUndefined.js";
import { assertAllowed } from "../../policies/policyResult.js";
import { canManageJob } from "../../policies/jobPolicy.js";
import type {
  CreateJobInput,
  UpdateJobInput,
  JobListQuery,
} from "./job.validation.js";

/**
 * companyId is deliberately never client-supplied — it's derived here
 * from the creating recruiter's own profile. This also means
 * canCreateJobForCompany() isn't called: the check it performs
 * (recruiter.companyId === companyId) would be tautologically true
 * every time, since there's no other companyId this could ever be.
 */
export async function createJob(
  actorUserId: string,
  input: CreateJobInput,
): Promise<IJob> {
  const recruiter = await RecruiterProfile.findOne({
    userId: actorUserId,
    deletedAt: null,
  });

  if (!recruiter) {
    throw new AppError(404, "RECRUITER_404", "Recruiter profile not found");
  }
  if (!recruiter.companyId) {
    throw new AppError(
      409,
      "RECRUITER_NO_COMPANY",
      "You must belong to a company before creating a job",
    );
  }

  const job = await Job.create({
    ...stripUndefined(input),
    companyId: recruiter.companyId,
    createdBy: recruiter._id,
  });

  return job;
}

/**
 * Public detail view for published/closed jobs. Draft jobs are only
 * visible to recruiters who could manage them — a draft shouldn't be
 * discoverable by anyone else, including via a guessed/shared URL.
 */
export async function getJobById(
  jobId: string,
  actorUserId?: string,
): Promise<IJob> {
  const job = await Job.findOne({ _id: jobId, isDeleted: false });

  if (!job) {
    throw new AppError(404, "JOB_404", "Job not found");
  }

  if (job.status === JobStatus.DRAFT) {
    if (!actorUserId) {
      throw new AppError(404, "JOB_404", "Job not found");
    }
    assertAllowed(await canManageJob(actorUserId, job));
  }

  return job;
}

interface JobListResult {
  jobs: IJob[];
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

/**
 * Public job feed — published jobs only, newest first. Basic filtering
 * for now; full-text/fuzzy search is the dedicated Search module's job,
 * not this one (see the architecture doc's phase separation).
 */
export async function listJobs(query: JobListQuery): Promise<JobListResult> {
  const filter: Record<string, unknown> = {
    status: JobStatus.PUBLISHED,
    isDeleted: false,
  };

  if (query.skill) filter.skillsRequired = query.skill.trim().toLowerCase();
  if (query.location) filter.location = query.location.trim().toLowerCase();
  if (query.employmentType) filter.employmentType = query.employmentType;
  if (query.experienceLevel) filter.experienceLevel = query.experienceLevel;
  if (query.isRemote !== undefined) filter.isRemote = query.isRemote;
  if (query.companyId) filter.companyId = query.companyId;

  const skip = (query.page - 1) * query.limit;

  const [jobs, totalCount] = await Promise.all([
    Job.find(filter).sort({ publishedAt: -1 }).skip(skip).limit(query.limit),
    Job.countDocuments(filter),
  ]);

  return {
    jobs,
    page: query.page,
    limit: query.limit,
    totalCount,
    totalPages: Math.ceil(totalCount / query.limit),
  };
}

export async function updateJob(
  actorUserId: string,
  jobId: string,
  input: UpdateJobInput,
): Promise<IJob> {
  const job = await Job.findOne({ _id: jobId, isDeleted: false });
  if (!job) {
    throw new AppError(404, "JOB_404", "Job not found");
  }

  assertAllowed(await canManageJob(actorUserId, job));

  Object.assign(job, stripUndefined(input));
  await job.save();

  return job;
}

export async function publishJob(
  actorUserId: string,
  jobId: string,
): Promise<IJob> {
  const job = await Job.findOne({ _id: jobId, isDeleted: false });
  if (!job) {
    throw new AppError(404, "JOB_404", "Job not found");
  }

  assertAllowed(await canManageJob(actorUserId, job));

  job.status = JobStatus.PUBLISHED; // pre('save') hook stamps publishedAt
  await job.save();

  return job;
}

export async function closeJob(
  actorUserId: string,
  jobId: string,
): Promise<IJob> {
  const job = await Job.findOne({ _id: jobId, isDeleted: false });
  if (!job) {
    throw new AppError(404, "JOB_404", "Job not found");
  }

  assertAllowed(await canManageJob(actorUserId, job));

  job.status = JobStatus.CLOSED;
  await job.save();

  return job;
}

export async function deleteJob(
  actorUserId: string,
  jobId: string,
): Promise<void> {
  const job = await Job.findOne({ _id: jobId, isDeleted: false });
  if (!job) {
    throw new AppError(404, "JOB_404", "Job not found");
  }

  assertAllowed(await canManageJob(actorUserId, job));

  job.isDeleted = true;
  job.deletedAt = new Date();
  await job.save();
}
