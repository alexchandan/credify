import type { Types } from "mongoose";
import { RecruiterProfile } from "../models/recruiterProfile.model.js";
import type { IJob } from "../models/job.model.js";
import { type PolicyResult, allow, deny } from "./policyResult.js";

/**
 * Can this user create a job under the given company?
 * Checked BEFORE a Job document exists, so it takes a companyId directly
 * rather than a Job instance.
 */
export async function canCreateJobForCompany(
  actorUserId: string,
  companyId: Types.ObjectId,
): Promise<PolicyResult> {
  const recruiter = await RecruiterProfile.findOne({
    userId: actorUserId,
    deletedAt: null,
  });

  if (!recruiter) {
    return deny("Only recruiters can create jobs");
  }
  if (!recruiter.companyId) {
    return deny("You must belong to a company before creating a job");
  }
  if (!recruiter.companyId.equals(companyId)) {
    return deny("You can only create jobs for the company you belong to");
  }

  return allow();
}

/**
 * Can this user edit/publish/close/delete an EXISTING job?
 * Deliberately checks the recruiter's CURRENT companyId, not job.createdBy —
 * a recruiter's company can change after a job was created, and once they
 * leave a company they should lose edit rights on jobs still owned by it,
 * even ones they originally authored.
 */
export async function canManageJob(
  actorUserId: string,
  job: IJob,
): Promise<PolicyResult> {
  const recruiter = await RecruiterProfile.findOne({
    userId: actorUserId,
    deletedAt: null,
  });

  if (!recruiter) {
    return deny("Only recruiters can manage jobs");
  }
  if (!recruiter.companyId || !recruiter.companyId.equals(job.companyId)) {
    return deny("You do not belong to the company that owns this job");
  }

  return allow();
}
