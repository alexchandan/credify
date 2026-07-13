import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import * as adminService from "./admin.service.js";
import type {
  UserListQuery,
  ModerateUserInput,
  CompanyListQuery,
  AdminJobListQuery,
} from "./admin.validation.js";

export async function listUsers(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as UserListQuery;
  const result = await adminService.listUsers(query);
  sendSuccess(res, {
    data: result.items,
    meta: {
      page: result.page,
      limit: result.limit,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
    },
  });
}

export async function moderateUser(req: Request, res: Response): Promise<void> {
  const input = req.body as ModerateUserInput;
  const user = await adminService.moderateUser(
    req.user!.userId,
    req.params.id as string,
    input,
  );
  const message =
    input.action === "suspend" ? "User suspended" : "User reactivated";
  sendSuccess(res, { data: user, message });
}

export async function listCompanies(
  req: Request,
  res: Response,
): Promise<void> {
  const query = req.query as unknown as CompanyListQuery;
  const result = await adminService.listCompanies(query);
  sendSuccess(res, {
    data: result.items,
    meta: {
      page: result.page,
      limit: result.limit,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
    },
  });
}

export async function deleteCompany(
  req: Request,
  res: Response,
): Promise<void> {
  await adminService.deleteCompany(req.user!.userId, req.params.id as string);
  sendSuccess(res, { data: null, message: "Company deleted" });
}

export async function listJobs(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as AdminJobListQuery;
  const result = await adminService.listJobs(query);
  sendSuccess(res, {
    data: result.items,
    meta: {
      page: result.page,
      limit: result.limit,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
    },
  });
}

export async function deleteJob(req: Request, res: Response): Promise<void> {
  await adminService.deleteJob(req.user!.userId, req.params.id as string);
  sendSuccess(res, { data: null, message: "Job deleted" });
}
