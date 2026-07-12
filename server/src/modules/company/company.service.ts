import mongoose from "mongoose";
import { Company, type ICompany } from "../../models/company.model.js";
import {
  RecruiterProfile,
  CompanyRole,
} from "../../models/recruiterProfile.model.js";
import { AppError } from "../../utils/AppError.js";
import { slugify } from "../../utils/slugify.js";
import { stripUndefined } from "../../utils/stripUndefined.js";
import { assertAllowed } from "../../policies/policyResult.js";
import { canManageCompany } from "../../policies/companyPolicy.js";
import type {
  CreateCompanyInput,
  UpdateCompanyInput,
} from "./company.validation.js";

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  const existing = await Company.findOne({ slug: baseSlug });
  if (existing) {
    throw new AppError(
      409,
      "COMPANY_SLUG_TAKEN",
      "A company with a similar name already exists. Please choose a different name.",
    );
  }
  return baseSlug;
}

/**
 * Creates a company AND attaches the creating recruiter as OWNER, in one
 * transaction — same pattern as register() in the auth module. If either
 * write failed alone, we'd end up with either an orphaned company (no
 * owner) or a recruiter pointing at a company that doesn't exist.
 */
export async function createCompany(
  actorUserId: string,
  input: CreateCompanyInput,
): Promise<ICompany> {
  const recruiter = await RecruiterProfile.findOne({
    userId: actorUserId,
    deletedAt: null,
  });

  if (!recruiter) {
    throw new AppError(404, "RECRUITER_404", "Recruiter profile not found");
  }
  if (recruiter.companyId) {
    throw new AppError(
      409,
      "RECRUITER_ALREADY_IN_COMPANY",
      "You already belong to a company. Leave your current company before creating a new one.",
    );
  }

  const slug = await ensureUniqueSlug(slugify(input.name));

  const session = await mongoose.startSession();
  let createdCompanyId: mongoose.Types.ObjectId;

  try {
    await session.withTransaction(async () => {
      const [company] = await Company.create(
        [
          {
            ...stripUndefined(input),
            slug,
            createdBy: recruiter._id,
          },
        ],
        { session },
      );

      if (!company) {
        // Genuinely should never happen — Company.create() with one input
        // document either returns one created doc or throws. This guards
        // against noUncheckedIndexedAccess's static "possibly undefined"
        // rather than a real runtime scenario.
        throw new Error("Company creation returned no document");
      }

      recruiter.companyId = company._id as mongoose.Types.ObjectId;
      recruiter.companyRole = CompanyRole.OWNER;
      await recruiter.save({ session });

      createdCompanyId = company._id as mongoose.Types.ObjectId;
    });
  } finally {
    await session.endSession();
  }

  const created = await Company.findById(createdCompanyId!);
  return created!;
}

export async function getCompanyById(companyId: string): Promise<ICompany> {
  const company = await Company.findOne({ _id: companyId, deletedAt: null });

  if (!company) {
    throw new AppError(404, "COMPANY_404", "Company not found");
  }

  return company;
}

export async function updateCompany(
  actorUserId: string,
  companyId: string,
  input: UpdateCompanyInput,
): Promise<ICompany> {
  const company = await getCompanyById(companyId);

  assertAllowed(await canManageCompany(actorUserId, company));

  Object.assign(company, stripUndefined(input));
  await company.save();

  return company;
}
