import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/AppError.js";
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

export async function uploadResume(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    throw new AppError(400, "VALIDATION_ERROR", "No resume file provided");
  }
  const profile = await candidateProfileService.uploadResume(
    req.user!.userId,
    req.file.buffer,
  );
  sendSuccess(res, { data: profile, message: "Resume uploaded" });
}

export async function deleteResume(req: Request, res: Response): Promise<void> {
  const profile = await candidateProfileService.deleteResume(req.user!.userId);
  sendSuccess(res, { data: profile, message: "Resume removed" });
}

export async function uploadAvatar(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    throw new AppError(400, "VALIDATION_ERROR", "No avatar image provided");
  }
  const profile = await candidateProfileService.uploadAvatar(
    req.user!.userId,
    req.file.buffer,
  );
  sendSuccess(res, { data: profile, message: "Avatar uploaded" });
}

export async function deleteAvatar(req: Request, res: Response): Promise<void> {
  const profile = await candidateProfileService.deleteAvatar(req.user!.userId);
  sendSuccess(res, { data: profile, message: "Avatar removed" });
}
