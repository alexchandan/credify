import mongoose from "mongoose";
import {
  Application,
  ApplicationStatus,
  type IApplication,
} from "../../models/application.model.js";
import { Job, JobStatus } from "../../models/job.model.js";
import { CandidateProfile } from "../../models/candidateProfile.model.js";
import { RecruiterProfile } from "../../models/recruiterProfile.model.js";
import { User } from "../../models/user.model.js";
import { Company } from "../../models/company.model.js";
import {
  Notification,
  NotificationType,
  RelatedEntityType,
} from "../../models/notification.model.js";
import { AppError } from "../../utils/AppError.js";
import { stripUndefined } from "../../utils/stripUndefined.js";
import { isDuplicateKeyErrorOnField } from "../../utils/mongoErrors.js";
import { assertAllowed } from "../../policies/policyResult.js";
import {
  canViewApplication,
  canUpdateApplicationStatus,
} from "../../policies/applicationPolicy.js";
import { canManageJob } from "../../policies/jobPolicy.js";
import { emailService, sendEmailSafely } from "../../utils/emailService.js";
import { emitRealtimeEvent } from "../notification/realtime.service.js";
import { env } from "../../config/env.js";
import type {
  ApplyToJobInput,
  ApplicationListQuery,
} from "./application.validation.js";

interface ApplicationListResult {
  applications: IApplication[];
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

/**
 * The core transaction: insert Application, increment Job.applicationCount,
 * notify the recruiter who posted the job — all atomic, per the pattern
 * established back when Application was first designed.
 */
export async function applyToJob(
  actorUserId: string,
  input: ApplyToJobInput,
): Promise<IApplication> {
  const candidate = await CandidateProfile.findOne({
    userId: actorUserId,
    deletedAt: null,
  });
  if (!candidate) {
    throw new AppError(404, "CANDIDATE_404", "Candidate profile not found");
  }

  // KNOWN, TEMPORARY LIMITATION: resume upload (file upload) hasn't been
  // built yet — it's the next module after this one. Application.resumeSnapshotUrl
  // is required on the schema, so without a resumeUrl there's nothing valid
  // to snapshot. Reject clearly here rather than letting this fail with a
  // raw Mongoose validation error deep inside the transaction.
  if (!candidate.resumeUrl) {
    throw new AppError(
      400,
      "CANDIDATE_RESUME_REQUIRED",
      "You must upload a resume before applying to jobs.",
    );
  }

  const job = await Job.findOne({ _id: input.jobId, isDeleted: false });
  if (!job) {
    throw new AppError(404, "JOB_404", "Job not found");
  }
  if (job.status !== JobStatus.PUBLISHED) {
    throw new AppError(
      400,
      "JOB_NOT_PUBLISHED",
      "This job is not open for applications",
    );
  }

  // Fast-path pre-check only — same pattern/caveat as ensureUniqueSlug in
  // company.service.ts. The real guarantee is the compound unique index
  // on (candidateId, jobId); the race is caught below.
  const existing = await Application.findOne({
    candidateId: candidate._id,
    jobId: job._id,
  });
  if (existing) {
    throw new AppError(
      409,
      "APPLICATION_DUPLICATE",
      "You have already applied to this job",
    );
  }

  const recruiter = await RecruiterProfile.findById(job.createdBy);
  if (!recruiter) {
    // Structurally shouldn't happen — createdBy is required+immutable and
    // RecruiterProfile isn't hard-deleted. A genuine invariant violation,
    // not a user-facing case, hence a plain throw rather than an AppError.
    throw new Error(
      "Job.createdBy does not reference an existing RecruiterProfile",
    );
  }

  const session = await mongoose.startSession();
  let applicationId: mongoose.Types.ObjectId;

  try {
    await session.withTransaction(async () => {
      // new + save (not .create()) — the pre('save') hook needs
      // _statusChangedBy set on the document before save() runs, and
      // .create() doesn't hand back a document to mutate first.
      const application = new Application({
        candidateId: candidate._id,
        jobId: job._id,
        companyId: job.companyId,
        resumeSnapshotUrl: candidate.resumeUrl,
        ...stripUndefined({ coverLetter: input.coverLetter }),
      }) as IApplication & { _statusChangedBy?: mongoose.Types.ObjectId };

      application._statusChangedBy = new mongoose.Types.ObjectId(actorUserId);
      await application.save({ session });

      await Job.updateOne(
        { _id: job._id },
        { $inc: { applicationCount: 1 } },
        { session },
      );

      await Notification.create(
        [
          {
            userId: recruiter.userId,
            type: NotificationType.APPLICATION_RECEIVED,
            message: `New application received for "${job.title}"`,
            relatedEntityType: RelatedEntityType.APPLICATION,
            relatedEntityId: application._id,
          },
        ],
        { session },
      );

      applicationId = application._id as mongoose.Types.ObjectId;
    });
  } catch (err) {
    if (isDuplicateKeyErrorOnField(err, "jobId")) {
      throw new AppError(
        409,
        "APPLICATION_DUPLICATE",
        "You have already applied to this job",
      );
    }
    throw err;
  } finally {
    await session.endSession();
  }

  const created = await Application.findById(applicationId!);

  // Emit real-time notification to recruiter
  emitRealtimeEvent(recruiter.userId.toString(), "notification", {
    type: NotificationType.APPLICATION_RECEIVED,
    message: `New application received for "${job.title}"`,
    relatedEntityType: RelatedEntityType.APPLICATION,
    relatedEntityId: created!._id,
    createdAt: new Date(),
  });
  emitRealtimeEvent(recruiter.userId.toString(), "application_received", {
    jobId: job._id,
    applicationId: created!._id,
  });

  // Send application confirmation email safely to candidate
  void (async () => {
    try {
      const candidateUser = await User.findById(candidate.userId).select(
        "email",
      );
      const company = await Company.findById(job.companyId).select("name");
      if (candidateUser?.email) {
        const clientOrigin = env.clientOrigins[0] || "http://localhost:3000";
        const applicationsUrl = `${clientOrigin}/candidate/applications`;
        await sendEmailSafely(() =>
          emailService.sendApplicationConfirmationEmail(
            candidateUser.email,
            candidate.fullName || "Candidate",
            job.title,
            company?.name || "Company",
            applicationsUrl,
          ),
        );
      }
    } catch {
      // Ignored - email is best-effort
    }
  })();

  return created!;
}

export async function getMyApplications(
  actorUserId: string,
  query: ApplicationListQuery,
): Promise<ApplicationListResult> {
  const candidate = await CandidateProfile.findOne({
    userId: actorUserId,
    deletedAt: null,
  });
  if (!candidate) {
    throw new AppError(404, "CANDIDATE_404", "Candidate profile not found");
  }

  const filter: Record<string, unknown> = { candidateId: candidate._id };
  if (query.status) filter.status = query.status;

  const result = await paginateApplications(filter, query);

  const jobIds = [
    ...new Set(result.applications.map((a) => a.jobId.toString())),
  ];
  const companyIds = [
    ...new Set(result.applications.map((a) => a.companyId.toString())),
  ];

  const [jobs, companies] = await Promise.all([
    Job.find({ _id: { $in: jobIds } }).select(
      "title location employmentType experienceLevel isRemote salaryRange status",
    ),
    Company.find({ _id: { $in: companyIds } }).select("name logoUrl"),
  ]);

  const jobMap = new Map(jobs.map((j) => [j._id.toString(), j]));
  const companyMap = new Map(companies.map((c) => [c._id.toString(), c]));

  const enriched = result.applications.map((app) => {
    const raw = (app as IApplication).toObject
      ? (app as IApplication).toObject()
      : app;
    return {
      ...raw,
      job: jobMap.get(app.jobId.toString()) ?? null,
      company: companyMap.get(app.companyId.toString()) ?? null,
    };
  });

  return {
    ...result,
    applications: enriched as unknown as IApplication[],
  };
}

/**
 * Recruiter view of applicants for one of their jobs — gated by
 * canManageJob, same policy used for editing/publishing/closing a job,
 * since reviewing applicants is itself a job-management action.
 */
export async function getApplicationsForJob(
  actorUserId: string,
  jobId: string,
  query: ApplicationListQuery,
): Promise<ApplicationListResult> {
  const job = await Job.findOne({ _id: jobId, isDeleted: false });
  if (!job) {
    throw new AppError(404, "JOB_404", "Job not found");
  }

  assertAllowed(await canManageJob(actorUserId, job));

  const filter: Record<string, unknown> = { jobId: job._id };
  if (query.status) filter.status = query.status;

  const result = await paginateApplications(filter, query);

  const candidateIds = [
    ...new Set(result.applications.map((a) => a.candidateId.toString())),
  ];
  const candidates = await CandidateProfile.find({
    _id: { $in: candidateIds },
  }).select("fullName headline avatarUrl skills location userId");

  const userIds = candidates.map((c) => c.userId);
  const users = await User.find({ _id: { $in: userIds } }).select("email");
  const userEmailMap = new Map(users.map((u) => [u._id.toString(), u.email]));

  const candidateMap = new Map(
    candidates.map((c) => [
      c._id.toString(),
      {
        _id: c._id,
        fullName: c.fullName,
        headline: c.headline,
        avatarUrl: c.avatarUrl,
        skills: c.skills,
        location: c.location,
        email: userEmailMap.get(c.userId.toString()) ?? null,
      },
    ]),
  );

  const enriched = result.applications.map((app) => {
    const raw = (app as IApplication).toObject
      ? (app as IApplication).toObject()
      : app;
    return {
      ...raw,
      candidate: candidateMap.get(app.candidateId.toString()) ?? null,
    };
  });

  return {
    ...result,
    applications: enriched as unknown as IApplication[],
  };
}

async function paginateApplications(
  filter: Record<string, unknown>,
  query: ApplicationListQuery,
): Promise<ApplicationListResult> {
  const skip = (query.page - 1) * query.limit;

  const [applications, totalCount] = await Promise.all([
    Application.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit),
    Application.countDocuments(filter),
  ]);

  return {
    applications,
    page: query.page,
    limit: query.limit,
    totalCount,
    totalPages: Math.ceil(totalCount / query.limit),
  };
}

export async function getApplicationById(
  actorUserId: string,
  applicationId: string,
): Promise<IApplication> {
  const application = await Application.findById(applicationId);
  if (!application) {
    throw new AppError(404, "APPLICATION_404", "Application not found");
  }

  assertAllowed(await canViewApplication(actorUserId, application));

  return application;
}

const TERMINAL_STATUSES: ApplicationStatus[] = [
  ApplicationStatus.WITHDRAWN,
  ApplicationStatus.REJECTED,
  ApplicationStatus.HIRED,
];

/**
 * canUpdateApplicationStatus (the policy) only answers "is this actor
 * EITHER the owning candidate OR a recruiter at the company" — it
 * deliberately doesn't know which transitions are valid for which role,
 * per its own doc comment. That enforcement lives here:
 *   - candidate: may only move to WITHDRAWN, and only from a non-terminal status
 *   - recruiter: may move to anything EXCEPT APPLIED/WITHDRAWN, and not at
 *     all once the candidate has withdrawn
 */
export async function updateApplicationStatus(
  actorUserId: string,
  applicationId: string,
  newStatus: ApplicationStatus,
): Promise<IApplication> {
  const application = await Application.findById(applicationId);
  if (!application) {
    throw new AppError(404, "APPLICATION_404", "Application not found");
  }

  assertAllowed(await canUpdateApplicationStatus(actorUserId, application));

  const [candidate, job] = await Promise.all([
    CandidateProfile.findById(application.candidateId),
    Job.findById(application.jobId),
  ]);
  if (!candidate || !job) {
    throw new Error(
      "Application references a missing candidate or job — data integrity issue",
    );
  }

  const recruiter = await RecruiterProfile.findById(job.createdBy);
  if (!recruiter) {
    throw new Error(
      "Job.createdBy does not reference an existing RecruiterProfile",
    );
  }

  const isActorTheCandidate = candidate.userId.toString() === actorUserId;

  if (isActorTheCandidate) {
    if (newStatus !== ApplicationStatus.WITHDRAWN) {
      throw new AppError(
        403,
        "AUTH_FORBIDDEN",
        "Candidates may only withdraw their own application",
      );
    }
    if (TERMINAL_STATUSES.includes(application.status)) {
      throw new AppError(
        409,
        "APPLICATION_ALREADY_FINALIZED",
        `This application is already "${application.status}" and cannot be changed`,
      );
    }
  } else {
    if (
      newStatus === ApplicationStatus.APPLIED ||
      newStatus === ApplicationStatus.WITHDRAWN
    ) {
      throw new AppError(
        403,
        "AUTH_FORBIDDEN",
        "Recruiters cannot set this status directly",
      );
    }
    if (application.status === ApplicationStatus.WITHDRAWN) {
      throw new AppError(
        409,
        "APPLICATION_ALREADY_FINALIZED",
        "This application was withdrawn by the candidate and cannot be updated",
      );
    }
  }

  // Notify whichever side didn't make the change.
  const notifyRecipientUserId = isActorTheCandidate
    ? recruiter.userId
    : candidate.userId;
  const actorObjectId = new mongoose.Types.ObjectId(actorUserId);

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const doc = application as IApplication & {
        _statusChangedBy?: mongoose.Types.ObjectId;
      };
      doc._statusChangedBy = actorObjectId;
      doc.status = newStatus;
      await doc.save({ session });

      await Notification.create(
        [
          {
            userId: notifyRecipientUserId,
            type: NotificationType.APPLICATION_STATUS_CHANGED,
            message: `Application status for "${job.title}" changed to ${newStatus}`,
            relatedEntityType: RelatedEntityType.APPLICATION,
            relatedEntityId: application._id,
          },
        ],
        { session },
      );
    });
  } finally {
    await session.endSession();
  }

  // Real-time SSE push notification
  emitRealtimeEvent(notifyRecipientUserId.toString(), "notification", {
    type: NotificationType.APPLICATION_STATUS_CHANGED,
    message: `Application status for "${job.title}" changed to ${newStatus}`,
    relatedEntityType: RelatedEntityType.APPLICATION,
    relatedEntityId: application._id,
    createdAt: new Date(),
  });
  emitRealtimeEvent(candidate.userId.toString(), "application_status_updated", {
    applicationId: application._id,
    status: newStatus,
    jobId: job._id,
  });

  // Email status update to candidate if changed by recruiter
  if (!isActorTheCandidate) {
    void (async () => {
      try {
        const candidateUser = await User.findById(candidate.userId).select(
          "email",
        );
        const company = await Company.findById(job.companyId).select("name");
        if (candidateUser?.email) {
          const clientOrigin = env.clientOrigins[0] || "http://localhost:3000";
          const applicationsUrl = `${clientOrigin}/candidate/applications`;
          await sendEmailSafely(() =>
            emailService.sendApplicationStatusUpdateEmail(
              candidateUser.email,
              candidate.fullName || "Candidate",
              job.title,
              company?.name || "Company",
              newStatus,
              applicationsUrl,
            ),
          );
        }
      } catch {
        // Ignored - email is best-effort
      }
    })();
  }

  return application;
}
