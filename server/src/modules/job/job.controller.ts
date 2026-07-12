import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import * as jobService from "./job.service.js";
import type {
  CreateJobInput,
  UpdateJobInput,
  JobListQuery,
} from "./job.validation.js";

export async function createJob(req: Request, res: Response): Promise<void> {
  const input = req.body as CreateJobInput;
  const job = await jobService.createJob(req.user!.userId, input);
  sendSuccess(res, {
    data: job,
    message: "Job created as draft",
    statusCode: 201,
  });
}

export async function getJobById(req: Request, res: Response): Promise<void> {
  const job = await jobService.getJobById(
    req.params.id as string,
    req.user?.userId,
  );
  sendSuccess(res, { data: job });
}

export async function listJobs(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as JobListQuery;
  const result = await jobService.listJobs(query);
  sendSuccess(res, {
    data: result.jobs,
    meta: {
      page: result.page,
      limit: result.limit,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
    },
  });
}

export async function updateJob(req: Request, res: Response): Promise<void> {
  const input = req.body as UpdateJobInput;
  const job = await jobService.updateJob(
    req.user!.userId,
    req.params.id as string,
    input,
  );
  sendSuccess(res, { data: job, message: "Job updated" });
}

export async function publishJob(req: Request, res: Response): Promise<void> {
  const job = await jobService.publishJob(
    req.user!.userId,
    req.params.id as string,
  );
  sendSuccess(res, { data: job, message: "Job published" });
}

export async function closeJob(req: Request, res: Response): Promise<void> {
  const job = await jobService.closeJob(
    req.user!.userId,
    req.params.id as string,
  );
  sendSuccess(res, { data: job, message: "Job closed" });
}

export async function deleteJob(req: Request, res: Response): Promise<void> {
  await jobService.deleteJob(req.user!.userId, req.params.id as string);
  sendSuccess(res, { data: null, message: "Job deleted" });
}
