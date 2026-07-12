import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import * as searchService from "./search.service.js";
import type {
  SearchCandidatesQuery,
  SearchJobsQuery,
} from "./search.validation.js";

export async function searchCandidates(
  req: Request,
  res: Response,
): Promise<void> {
  const query = req.query as unknown as SearchCandidatesQuery;
  const result = await searchService.searchCandidates(query);
  sendSuccess(res, {
    data: result.results,
    meta: {
      page: result.page,
      limit: result.limit,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
    },
  });
}

export async function searchJobs(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as SearchJobsQuery;
  const result = await searchService.searchJobs(query);
  sendSuccess(res, {
    data: result.results,
    meta: {
      page: result.page,
      limit: result.limit,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
    },
  });
}
