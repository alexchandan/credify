// UNVERIFIED AGAINST A LIVE ATLAS CLUSTER — see the note on
// createSearchIndexes.ts. The aggregation pipelines below are correct by
// inspection (standard Atlas Search $search/$searchMeta syntax) but have
// not been run against a real index from this environment. Test this
// module first and carefully once real Atlas Search indexes exist.

import {
  CandidateProfile,
  type ICandidateProfile,
} from "../../models/candidateProfile.model.js";
import { Job, JobStatus, type IJob } from "../../models/job.model.js";
import {
  CANDIDATE_SEARCH_INDEX,
  JOB_SEARCH_INDEX,
} from "../../scripts/createSearchIndexes.js";
import type {
  SearchCandidatesQuery,
  SearchJobsQuery,
} from "./search.validation.js";

interface SearchResult<T> {
  results: T[];
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export async function searchCandidates(
  query: SearchCandidatesQuery,
): Promise<SearchResult<ICandidateProfile>> {
  const skip = (query.page - 1) * query.limit;

  const compound = {
    must: [
      {
        text: {
          query: query.q,
          path: ["fullName", "headline", "skills"],
          fuzzy: {},
        },
      },
    ],
    filter: [
      ...(query.location
        ? [{ text: { query: query.location, path: "location" } }]
        : []),
      ...(query.availability
        ? [{ equals: { path: "availability", value: query.availability } }]
        : []),
    ],
  };

  const [results, countResult] = await Promise.all([
    CandidateProfile.aggregate([
      { $search: { index: CANDIDATE_SEARCH_INDEX, compound } },
      // deletedAt filtering happens here, via a normal $match against the
      // existing deletedAt index — not inside the Atlas Search query
      // itself, which handles null-matching on non-string fields awkwardly.
      { $match: { deletedAt: null } },
      { $skip: skip },
      { $limit: query.limit },
    ]),
    CandidateProfile.aggregate([
      {
        $searchMeta: {
          index: CANDIDATE_SEARCH_INDEX,
          compound,
          count: { type: "total" },
        },
      },
    ]),
  ]);

  const totalCount: number = countResult[0]?.count?.total ?? 0;

  return {
    results,
    page: query.page,
    limit: query.limit,
    totalCount,
    totalPages: Math.ceil(totalCount / query.limit),
  };
}

export async function searchJobs(
  query: SearchJobsQuery,
): Promise<SearchResult<IJob>> {
  const skip = (query.page - 1) * query.limit;

  const compound = {
    must: [
      {
        text: {
          query: query.q,
          path: ["title", "description", "skillsRequired"],
          fuzzy: {},
        },
      },
    ],
    filter: [
      ...(query.location
        ? [{ text: { query: query.location, path: "location" } }]
        : []),
      ...(query.employmentType
        ? [{ equals: { path: "employmentType", value: query.employmentType } }]
        : []),
      ...(query.experienceLevel
        ? [
            {
              equals: { path: "experienceLevel", value: query.experienceLevel },
            },
          ]
        : []),
    ],
  };

  const [results, countResult] = await Promise.all([
    Job.aggregate([
      { $search: { index: JOB_SEARCH_INDEX, compound } },
      // Same reasoning as searchCandidates — status/isDeleted filtered via
      // normal $match, not encoded into the Atlas Search query itself.
      { $match: { status: JobStatus.PUBLISHED, isDeleted: false } },
      { $skip: skip },
      { $limit: query.limit },
    ]),
    Job.aggregate([
      {
        $searchMeta: {
          index: JOB_SEARCH_INDEX,
          compound,
          count: { type: "total" },
        },
      },
    ]),
  ]);

  const totalCount: number = countResult[0]?.count?.total ?? 0;

  return {
    results,
    page: query.page,
    limit: query.limit,
    totalCount,
    totalPages: Math.ceil(totalCount / query.limit),
  };
}
