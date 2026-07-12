import {
  RecruiterProfile,
  type IRecruiterProfile,
} from "../../models/recruiterProfile.model.js";
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
