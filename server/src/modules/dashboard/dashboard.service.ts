import type { Types } from "mongoose";
import { User } from "../../models/user.model.js";
import {
  CandidateProfile,
  type ICandidateProfile,
} from "../../models/candidateProfile.model.js";
import { RecruiterProfile } from "../../models/recruiterProfile.model.js";
import { Company } from "../../models/company.model.js";
import { Job, JobStatus } from "../../models/job.model.js";
import { Application } from "../../models/application.model.js";
import { SavedCandidate } from "../../models/savedCandidate.model.js";
import { Notification } from "../../models/notification.model.js";
import { AppError } from "../../utils/AppError.js";

function calculateProfileCompletion(candidate: ICandidateProfile): number {
  const checks = [
    Boolean(candidate.headline),
    candidate.skills.length > 0,
    Boolean(candidate.location),
    Boolean(candidate.resumeUrl),
    candidate.education.length > 0,
    candidate.experience.length > 0,
  ];
  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

/**
 * Manual join rather than Mongoose .populate() — kept consistent with the
 * rest of the project, which doesn't use populate() anywhere else, in
 * favor of explicit, typed lookups.
 */
async function attachJobTitles(
  applications: {
    _id: Types.ObjectId;
    jobId: Types.ObjectId;
    status: string;
    createdAt: Date;
  }[],
) {
  const jobIds = applications.map((a) => a.jobId);
  const jobs = await Job.find({ _id: { $in: jobIds } }).select("title");
  const jobTitleById = new Map(jobs.map((j) => [j._id.toString(), j.title]));

  return applications.map((a) => ({
    _id: a._id,
    status: a.status,
    createdAt: a.createdAt,
    jobTitle: jobTitleById.get(a.jobId.toString()) ?? null,
  }));
}

function statusCountsToMap(
  counts: { _id: string; count: number }[],
): Record<string, number> {
  return Object.fromEntries(counts.map((c) => [c._id, c.count]));
}

export async function getCandidateDashboard(userId: string) {
  const candidate = await CandidateProfile.findOne({ userId, deletedAt: null });
  if (!candidate) {
    throw new AppError(404, "CANDIDATE_404", "Candidate profile not found");
  }

  const [statusCounts, recentApplicationsRaw, recentNotifications] =
    await Promise.all([
      Application.aggregate<{ _id: string; count: number }>([
        { $match: { candidateId: candidate._id } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Application.find({ candidateId: candidate._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("jobId status createdAt"),
      Notification.find({ userId }).sort({ createdAt: -1 }).limit(5),
    ]);

  const byStatus = statusCountsToMap(statusCounts);
  const totalApplications = statusCounts.reduce((sum, s) => sum + s.count, 0);

  return {
    profileCompletionPercent: calculateProfileCompletion(candidate),
    resumeStatus: {
      hasResume: Boolean(candidate.resumeUrl),
      resumeUrl: candidate.resumeUrl ?? null,
    },
    applications: { total: totalApplications, byStatus },
    recentApplications: await attachJobTitles(recentApplicationsRaw),
    recentNotifications,
  };
}

export async function getRecruiterDashboard(userId: string) {
  const recruiter = await RecruiterProfile.findOne({ userId, deletedAt: null });
  if (!recruiter) {
    throw new AppError(404, "RECRUITER_404", "Recruiter profile not found");
  }

  // No company yet is a normal state right after registration — return a
  // minimal shape rather than erroring, so the dashboard still renders
  // with a clear "create a company to get started" signal on the frontend.
  if (!recruiter.companyId) {
    return {
      hasCompany: false,
      activeJobsCount: 0,
      totalJobsCount: 0,
      applications: { total: 0, byStatus: {} },
      savedCandidatesCount: 0,
      recentApplications: [],
    };
  }

  const [
    activeJobsCount,
    totalJobsCount,
    statusCounts,
    savedCandidatesCount,
    recentApplicationsRaw,
  ] = await Promise.all([
    Job.countDocuments({
      companyId: recruiter.companyId,
      status: JobStatus.PUBLISHED,
      isDeleted: false,
    }),
    Job.countDocuments({ companyId: recruiter.companyId, isDeleted: false }),
    Application.aggregate<{ _id: string; count: number }>([
      { $match: { companyId: recruiter.companyId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    SavedCandidate.countDocuments({ recruiterId: recruiter._id }),
    Application.find({ companyId: recruiter.companyId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("jobId status createdAt"),
  ]);

  const byStatus = statusCountsToMap(statusCounts);
  const totalApplications = statusCounts.reduce((sum, s) => sum + s.count, 0);

  return {
    hasCompany: true,
    activeJobsCount,
    totalJobsCount,
    applications: { total: totalApplications, byStatus },
    savedCandidatesCount,
    recentApplications: await attachJobTitles(recentApplicationsRaw),
  };
}

/**
 * KNOWN GAP, deliberately not papered over: this dashboard does NOT
 * include a "recent activity" section backed by ActivityLog, because no
 * service anywhere in the project actually writes to that collection —
 * it was designed in Phase 1 but never instrumented. Querying it here
 * would silently return an empty array forever and look like a working
 * feature when it isn't. Real fix is to add ActivityLog.create() calls
 * to the actions worth auditing (job deletion, user moderation, etc.),
 * not something to fake at the dashboard layer.
 */
export async function getAdminDashboard() {
  const [
    totalUsers,
    totalCandidates,
    totalRecruiters,
    totalCompanies,
    jobStatusCounts,
    totalApplications,
  ] = await Promise.all([
    User.countDocuments({ deletedAt: null }),
    CandidateProfile.countDocuments({ deletedAt: null }),
    RecruiterProfile.countDocuments({ deletedAt: null }),
    Company.countDocuments({ deletedAt: null }),
    Job.aggregate<{ _id: string; count: number }>([
      { $match: { isDeleted: false } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Application.countDocuments({}),
  ]);

  const jobsByStatus = statusCountsToMap(jobStatusCounts);
  const totalJobs = jobStatusCounts.reduce((sum, s) => sum + s.count, 0);

  return {
    users: {
      total: totalUsers,
      candidates: totalCandidates,
      recruiters: totalRecruiters,
    },
    totalCompanies,
    jobs: { total: totalJobs, byStatus: jobsByStatus },
    totalApplications,
  };
}
