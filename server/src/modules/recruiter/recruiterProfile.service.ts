import mongoose from "mongoose";
import {
  RecruiterProfile,
  CompanyRole,
  type IRecruiterProfile,
} from "../../models/recruiterProfile.model.js";
import { Company } from "../../models/company.model.js";
import { AppError } from "../../utils/AppError.js";
import type { UpdateRecruiterProfileInput } from "./recruiterProfile.validation.js";

export async function getMyProfile(userId: string): Promise<IRecruiterProfile> {
  const profile = await RecruiterProfile.findOne({ userId, deletedAt: null });

  if (!profile) {
    throw new AppError(404, "RECRUITER_404", "Recruiter profile not found");
  }

  return profile;
}

export async function updateMyProfile(
  userId: string,
  input: UpdateRecruiterProfileInput,
): Promise<IRecruiterProfile> {
  const updated = await RecruiterProfile.findOneAndUpdate(
    { userId, deletedAt: null },
    { $set: input },
    { new: true, runValidators: true },
  );

  if (!updated) {
    throw new AppError(404, "RECRUITER_404", "Recruiter profile not found");
  }

  return updated;
}

// Recruiter leave thier company
// If there only one person in the company. Transfer the ownership before leaving the company.
export async function leaveCompany(
  actorUserId: string,
): Promise<IRecruiterProfile> {
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
      "You do not belong to a company",
    );
  }

  const companyId = recruiter.companyId;
  const isOwner = recruiter.companyRole === CompanyRole.OWNER;

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      if (isOwner) {
        const otherRecruiterCount = await RecruiterProfile.countDocuments({
          companyId,
          userId: { $ne: recruiter.userId },
          deletedAt: null,
        }).session(session);

        if (otherRecruiterCount > 0) {
          throw new AppError(
            409,
            "RECRUITER_OWNER_MUST_TRANSFER",
            "You are the owner of this company and other recruiters still belong to it. Transfer ownership before leaving.",
          );
        }

        // Sole owner, no other members — soft-delete the now-ownerless company.
        await Company.updateOne(
          { _id: companyId },
          { deletedAt: new Date() },
          { session },
        );
      }

      recruiter.companyId = null;
      recruiter.companyRole = null;
      await recruiter.save({ session });
    });
  } finally {
    await session.endSession();
  }

  return recruiter;
}
