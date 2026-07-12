import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import * as applicationService from "./application.service.js";
import type {
  ApplyToJobInput,
  UpdateApplicationStatusInput,
  ApplicationListQuery,
} from "./application.validation.js";

export async function applyToJob(req: Request, res: Response): Promise<void> {
  const input = req.body as ApplyToJobInput;
  const application = await applicationService.applyToJob(
    req.user!.userId,
    input,
  );
  sendSuccess(res, {
    data: application,
    message: "Application submitted",
    statusCode: 201,
  });
}

export async function getMyApplications(
  req: Request,
  res: Response,
): Promise<void> {
  const query = req.query as unknown as ApplicationListQuery;
  const result = await applicationService.getMyApplications(
    req.user!.userId,
    query,
  );
  sendSuccess(res, {
    data: result.applications,
    meta: {
      page: result.page,
      limit: result.limit,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
    },
  });
}

export async function getApplicationsForJob(
  req: Request,
  res: Response,
): Promise<void> {
  const query = req.query as unknown as ApplicationListQuery;
  const result = await applicationService.getApplicationsForJob(
    req.user!.userId,
    req.params.jobId as string,
    query,
  );
  sendSuccess(res, {
    data: result.applications,
    meta: {
      page: result.page,
      limit: result.limit,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
    },
  });
}

export async function getApplicationById(
  req: Request,
  res: Response,
): Promise<void> {
  const application = await applicationService.getApplicationById(
    req.user!.userId,
    req.params.id as string,
  );
  sendSuccess(res, { data: application });
}

export async function updateApplicationStatus(
  req: Request,
  res: Response,
): Promise<void> {
  const { status } = req.body as UpdateApplicationStatusInput;
  const application = await applicationService.updateApplicationStatus(
    req.user!.userId,
    req.params.id as string,
    status,
  );
  sendSuccess(res, {
    data: application,
    message: "Application status updated",
  });
}
