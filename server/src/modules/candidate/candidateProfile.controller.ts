// src/modules/candidate/candidateProfile.controller.ts
import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import * as candidateProfileService from "./candidateProfile.service.js";
import type { UpdateCandidateProfileInput } from "./candidateProfile.validation.js";

export async function getMyProfile(req: Request, res: Response): Promise<void> {
  const profile = await candidateProfileService.getMyProfile(req.user!.userId);
  sendSuccess(res, { data: profile });
}

export async function updateMyProfile(
  req: Request,
  res: Response,
): Promise<void> {
  const input = req.body as UpdateCandidateProfileInput;
  const profile = await candidateProfileService.updateMyProfile(
    req.user!.userId,
    input,
  );
  sendSuccess(res, { data: profile, message: "Profile updated" });
}

export async function getCandidateById(
  req: Request,
  res: Response,
): Promise<void> {
  const profile = await candidateProfileService.getCandidateById(
    req.params.id as string,
  );
  sendSuccess(res, { data: profile });
}
