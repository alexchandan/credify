import {
  RecruiterProfile,
  CompanyRole,
} from "../models/recruiterProfile.model.js";
import type { ICompany } from "../models/company.model.js";
import { type PolicyResult, allow, deny } from "./policyResult.js";

/**
 * Can this user edit company details / manage recruiters at this company?
 * OWNER and ADMIN can; MEMBER explicitly cannot — a member can manage
 * their own job postings (see jobPolicy.ts) but not company-wide settings.
 */
export async function canManageCompany(
  actorUserId: string,
  company: ICompany,
): Promise<PolicyResult> {
  const recruiter = await RecruiterProfile.findOne({
    userId: actorUserId,
    deletedAt: null,
  });

  if (
    !recruiter ||
    !recruiter.companyId ||
    !recruiter.companyId.equals(company._id)
  ) {
    return deny("You do not belong to this company");
  }

  if (
    recruiter.companyRole !== CompanyRole.OWNER &&
    recruiter.companyRole !== CompanyRole.ADMIN
  ) {
    return deny("Only company owners and admins can manage company details");
  }

  return allow();
}
