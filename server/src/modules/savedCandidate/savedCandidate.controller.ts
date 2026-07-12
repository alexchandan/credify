import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import * as savedCandidateService from "./savedCandidate.service.js";
import type {
  SaveCandidateInput,
  UpdateSavedCandidateInput,
  SavedCandidateListQuery,
} from "./savedCandidate.validation.js";

export async function saveCandidate(
  req: Request,
  res: Response,
): Promise<void> {
  const input = req.body as SaveCandidateInput;
  const saved = await savedCandidateService.saveCandidate(
    req.user!.userId,
    input,
  );
  sendSuccess(res, {
    data: saved,
    message: "Candidate saved",
    statusCode: 201,
  });
}

export async function getMySavedCandidates(
  req: Request,
  res: Response,
): Promise<void> {
  const query = req.query as unknown as SavedCandidateListQuery;
  const result = await savedCandidateService.getMySavedCandidates(
    req.user!.userId,
    query,
  );
  sendSuccess(res, {
    data: result.savedCandidates,
    meta: {
      page: result.page,
      limit: result.limit,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
    },
  });
}

export async function updateSavedCandidate(
  req: Request,
  res: Response,
): Promise<void> {
  const input = req.body as UpdateSavedCandidateInput;
  const saved = await savedCandidateService.updateSavedCandidate(
    req.user!.userId,
    req.params.id as string,
    input,
  );
  sendSuccess(res, { data: saved, message: "Note updated" });
}

export async function unsaveCandidate(
  req: Request,
  res: Response,
): Promise<void> {
  await savedCandidateService.unsaveCandidate(
    req.user!.userId,
    req.params.id as string,
  );
  sendSuccess(res, {
    data: null,
    message: "Candidate removed from saved list",
  });
}
