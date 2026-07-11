import { CandidateProfile } from "../models/candidateProfile.model.js";
import { RecruiterProfile } from "../models/recruiterProfile.model.js";
import type { IApplication } from "../models/application.model.js";
import { type PolicyResult, allow, deny } from "./policyResult.js";

/**
 * Can this user VIEW this application?
 * Two independent paths to "yes":
 *   - the candidate who owns it
 *   - a recruiter belonging to the company the application was made to
 */
export async function canViewApplication(
  actorUserId: string,
  application: IApplication,
): Promise<PolicyResult> {
  const candidate = await CandidateProfile.findById(application.candidateId);
  if (candidate && candidate.userId.toString() === actorUserId) {
    return allow();
  }

  const recruiter = await RecruiterProfile.findOne({
    userId: actorUserId,
    deletedAt: null,
  });
  if (
    recruiter?.companyId &&
    recruiter.companyId.equals(application.companyId)
  ) {
    return allow();
  }

  return deny("You do not have access to this application");
}

/**
 * Can this user change the STATUS of this application?
 * A candidate may only withdraw their own application (a specific status
 * transition, enforced by the service layer, not this policy) —
 * everything else is recruiter-only, and only for recruiters at the
 * owning company.
 */
export async function canUpdateApplicationStatus(
  actorUserId: string,
  application: IApplication,
): Promise<PolicyResult> {
  const recruiter = await RecruiterProfile.findOne({
    userId: actorUserId,
    deletedAt: null,
  });
  if (
    recruiter?.companyId &&
    recruiter.companyId.equals(application.companyId)
  ) {
    return allow();
  }

  const candidate = await CandidateProfile.findById(application.candidateId);
  if (candidate && candidate.userId.toString() === actorUserId) {
    return allow();
  }

  return deny("You do not have permission to update this application");
}
