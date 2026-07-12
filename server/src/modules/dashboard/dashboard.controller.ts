import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import * as dashboardService from "./dashboard.service.js";

export async function getCandidateDashboard(
  req: Request,
  res: Response,
): Promise<void> {
  const data = await dashboardService.getCandidateDashboard(req.user!.userId);
  sendSuccess(res, { data });
}

export async function getRecruiterDashboard(
  req: Request,
  res: Response,
): Promise<void> {
  const data = await dashboardService.getRecruiterDashboard(req.user!.userId);
  sendSuccess(res, { data });
}

export async function getAdminDashboard(
  _req: Request,
  res: Response,
): Promise<void> {
  const data = await dashboardService.getAdminDashboard();
  sendSuccess(res, { data });
}
