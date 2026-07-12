import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import * as recruiterProfileService from "./recruiterProfile.service.js";
import type { UpdateRecruiterProfileInput } from "./recruiterProfile.validation.js";

export async function getMyProfile(req: Request, res: Response): Promise<void> {
  const profile = await recruiterProfileService.getMyProfile(req.user!.userId);
  sendSuccess(res, { data: profile });
}

export async function updateMyProfile(
  req: Request,
  res: Response,
): Promise<void> {
  const input = req.body as UpdateRecruiterProfileInput;
  const profile = await recruiterProfileService.updateMyProfile(
    req.user!.userId,
    input,
  );
  sendSuccess(res, { data: profile, message: "Profile updated" });
}
