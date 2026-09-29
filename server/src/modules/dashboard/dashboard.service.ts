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
import type { ApplicationStatus } from "../../models/application.model.js";
import { SavedCandidate } from "../../models/savedCandidate.model.js";
import { Notification } from "../../models/notification.model.js";
import { AppError } from "../../utils/AppError.js";

export function calculateMedian(values: number[]): number | null {
  if (values.length === 0) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const middleValue = sorted[middle];
  if (middleValue === undefined) return null;

  if (sorted.length % 2 === 1) return Math.round(middleValue);

  const lowerValue = sorted[middle - 1];
  if (lowerValue === undefined) return Math.round(middleValue);
  return Math.round((lowerValue + middleValue) / 2);
}

export async function getPublicDashboard() {
  const publishedFilter = {
    status: JobStatus.PUBLISHED,
    isDeleted: false,
  };

  const [
    publishedJobsCount,
    remoteJobsCount,
    hiringCompanyIds,
    salaryRows,
    topSkills,
    topCompanyRows,
    featuredJobRows,
  ] = await Promise.all([
    Job.countDocuments(publishedFilter),
    Job.countDocuments({ ...publishedFilter, isRemote: true }),
    Job.distinct("companyId", publishedFilter),
    Job.find({
      ...publishedFilter,
      "salaryRange.currency": "INR",
      $or: [
        { "salaryRange.min": { $exists: true } },
        { "salaryRange.max": { $exists: true } },
      ],
    })
      .select("salaryRange")
      .lean(),
    Job.aggregate<{ _id: string; count: number }>([
      { $match: publishedFilter },
      { $unwind: "$skillsRequired" },
      { $group: { _id: "$skillsRequired", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 6 },
    ]),
    Job.aggregate<{ _id: Types.ObjectId; openJobsCount: number }>([
      { $match: publishedFilter },
      { $group: { _id: "$companyId", openJobsCount: { $sum: 1 } } },
      { $sort: { openJobsCount: -1, _id: 1 } },
      { $limit: 8 },
    ]),
    Job.find(publishedFilter)
      .sort({ publishedAt: -1, _id: -1 })
      .limit(6)
      .lean(),
  ]);

  const salaryMidpoints = salaryRows.flatMap(({ salaryRange }) => {
    if (!salaryRange) return [];
    if (salaryRange.min !== undefined && salaryRange.max !== undefined) {
      return [(salaryRange.min + salaryRange.max) / 2];
    }
    const disclosedAmount = salaryRange.min ?? salaryRange.max;
    return disclosedAmount === undefined ? [] : [disclosedAmount];
  });

  const companyIds = [
    ...new Set([
      ...topCompanyRows.map((row) => row._id.toString()),
      ...featuredJobRows.map((job) => job.companyId.toString()),
    ]),
  ];
  const companies = await Company.find({
    _id: { $in: companyIds },
    deletedAt: null,
  })
    .select("name logoUrl industry")
    .lean();
  const companyById = new Map(
    companies.map((company) => [company._id.toString(), company]),
  );

  return {
    metrics: {
      publishedJobsCount,
      hiringCompaniesCount: hiringCompanyIds.length,
      remoteJobsCount,
      medianAnnualSalaryInr: calculateMedian(salaryMidpoints),
      salaryListingsCount: salaryMidpoints.length,
    },
    topSkills: topSkills.map((row) => ({
      skill: row._id,
      openJobsCount: row.count,
    })),
    hiringCompanies: topCompanyRows.flatMap((row) => {
      const company = companyById.get(row._id.toString());
      if (!company) return [];
      return [
        {
          _id: company._id,
          name: company.name,
          logoUrl: company.logoUrl,
          industry: company.industry,
          openJobsCount: row.openJobsCount,
        },
      ];
    }),
    featuredJobs: featuredJobRows.map((job) => ({
      ...job,
      companyName:
        companyById.get(job.companyId.toString())?.name ??
        "Company unavailable",
    })),
  };
}

type ProfileCompletionSource = Pick<
  ICandidateProfile,
  "headline" | "skills" | "location" | "resumeUrl" | "education" | "experience"
>;

export function calculateProfileCompletion(
  candidate: ProfileCompletionSource,
): number {
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
    status: ApplicationStatus;
    createdAt: Date;
  }[],
) {
  const jobIds = applications.map((a) => a.jobId);
  const jobs = await Job.find({
    _id: { $in: jobIds },
    isDeleted: false,
  }).select("title");
  const jobTitleById = new Map(jobs.map((j) => [j._id.toString(), j.title]));

  return applications.map((a) => ({
    _id: a._id,
    jobId: a.jobId,
    status: a.status,
    createdAt: a.createdAt,
    jobTitle: jobTitleById.get(a.jobId.toString()) ?? null,
  }));
}

export function statusCountsToMap(
  counts: { _id: string; count: number }[],
): Record<string, number> {
  return Object.fromEntries(counts.map((c) => [c._id, c.count]));
}

export async function getCandidateDashboard(userId: string) {
  const candidate = await CandidateProfile.findOne({
    userId,
    deletedAt: null,
  }).select(
    "headline skills location resumeUrl resumeUploadedAt education experience",
  );
  if (!candidate) {
    throw new AppError(404, "CANDIDATE_404", "Candidate profile not found");
  }

  const [
    statusCounts,
    recentApplicationsRaw,
    recentNotifications,
    unreadNotificationsCount,
  ] = await Promise.all([
    Application.aggregate<{ _id: string; count: number }>([
      { $match: { candidateId: candidate._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Application.find({ candidateId: candidate._id })
      .sort({ createdAt: -1, _id: -1 })
      .limit(5)
      .select("jobId status createdAt"),
    Notification.find({ userId })
      .sort({ createdAt: -1, _id: -1 })
      .limit(5)
      .select(
        "type message relatedEntityType relatedEntityId isRead readAt createdAt",
      )
      .lean(),
    Notification.countDocuments({ userId, isRead: false }),
  ]);

  const byStatus = statusCountsToMap(statusCounts);
  const totalApplications = statusCounts.reduce((sum, s) => sum + s.count, 0);

  return {
    profileCompletionPercent: calculateProfileCompletion(candidate),
    resumeStatus: {
      hasResume: Boolean(candidate.resumeUrl),
      resumeUrl: candidate.resumeUrl ?? null,
      uploadedAt: candidate.resumeUploadedAt ?? null,
    },
    applications: { total: totalApplications, byStatus },
    recentApplications: await attachJobTitles(recentApplicationsRaw),
    recentNotifications,
    unreadNotificationsCount,
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
      .sort({ createdAt: -1, _id: -1 })
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
