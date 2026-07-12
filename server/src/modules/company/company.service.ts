import mongoose from "mongoose";
import { Company, type ICompany } from "../../models/company.model.js";
import {
  RecruiterProfile,
  CompanyRole,
} from "../../models/recruiterProfile.model.js";
import { AppError } from "../../utils/AppError.js";
import { slugify } from "../../utils/slugify.js";
import { stripUndefined } from "../../utils/stripUndefined.js";
import { isDuplicateKeyErrorOnField } from "../../utils/mongoErrors.js";
import { assertAllowed } from "../../policies/policyResult.js";
import { canManageCompany } from "../../policies/companyPolicy.js";
import type {
  CreateCompanyInput,
  UpdateCompanyInput,
} from "./company.validation.js";

/**
 * Fast-path check only — NOT the actual uniqueness guarantee. Two
 * concurrent createCompany() calls for the same name can both pass this
 * check before either transaction commits (TOCTOU race). The real
 * guarantee is the unique index on Company.slug; the E11000 it produces
 * in that race is caught and translated below, in createCompany().
 * This pre-check exists purely so the common (non-racing) case gets a
 * clean 409 without ever starting a transaction.
 */
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
  } catch (err) {
    // The pre-check above is only an optimization — it can't prevent two
    // concurrent requests for the same name both passing it before either
    // transaction commits. The unique index on Company.slug is the real
    // guarantee, and a losing concurrent request surfaces here as a raw
    // E11000. Translate it into the same clean, expected error the
    // pre-check would have produced, rather than letting a raw Mongo
    // driver error fall through to errorHandler's generic DUPLICATE_ENTRY.
    if (isDuplicateKeyErrorOnField(err, "slug")) {
      throw new AppError(
        409,
        "COMPANY_SLUG_TAKEN",
        "A company with a similar name already exists. Please choose a different name.",
      );
    }
    throw err;
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
