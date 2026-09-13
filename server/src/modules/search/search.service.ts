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

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function searchCandidatesMongoFallback(
  query: SearchCandidatesQuery,
): Promise<SearchResult<ICandidateProfile>> {
  const skip = (query.page - 1) * query.limit;
  const filter: Record<string, unknown> = {
    deletedAt: null,
  };

  if (query.q) {
    const qPattern = new RegExp(escapeRegex(query.q), "i");
    filter.$or = [
      { fullName: qPattern },
      { headline: qPattern },
      { skills: qPattern },
    ];
  }

  if (query.skill) {
    filter.skills = new RegExp(escapeRegex(query.skill.trim()), "i");
  }

  if (query.location) {
    filter.location = new RegExp(escapeRegex(query.location.trim()), "i");
  }

  if (query.availability) {
    filter.availability = query.availability;
  }

  const [results, totalCount] = await Promise.all([
    CandidateProfile.find(filter)
      .sort({ updatedAt: -1, _id: -1 })
      .skip(skip)
      .limit(query.limit)
      .lean(),
    CandidateProfile.countDocuments(filter),
  ]);

  return {
    results: results as ICandidateProfile[],
    page: query.page,
    limit: query.limit,
    totalCount,
    totalPages: Math.ceil(totalCount / query.limit),
  };
}

export async function searchCandidates(
  query: SearchCandidatesQuery,
): Promise<SearchResult<ICandidateProfile>> {
  if (!query.q) {
    return searchCandidatesMongoFallback(query);
  }

  try {
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
  } catch {
    return searchCandidatesMongoFallback(query);
  }
}

export async function searchJobs(
  query: SearchJobsQuery,
): Promise<SearchResult<IJob>> {
  const skip = (query.page - 1) * query.limit;
  const postSearchFilter: Record<string, unknown> = {
    status: JobStatus.PUBLISHED,
    isDeleted: false,
  };

  if (query.employmentType) {
    postSearchFilter.employmentType = query.employmentType;
  }
  if (query.experienceLevel) {
    postSearchFilter.experienceLevel = query.experienceLevel;
  }

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
    ],
  };

  const [facetedResult] = await Job.aggregate<{
    results: IJob[];
    count: Array<{ total: number }>;
  }>([
    { $search: { index: JOB_SEARCH_INDEX, compound } },
    { $match: postSearchFilter },
    {
      $facet: {
        results: [{ $skip: skip }, { $limit: query.limit }],
        count: [{ $count: "total" }],
      },
    },
  ]);

  const results = facetedResult?.results ?? [];
  const totalCount = facetedResult?.count[0]?.total ?? 0;

  return {
    results,
    page: query.page,
    limit: query.limit,
    totalCount,
    totalPages: Math.ceil(totalCount / query.limit),
  };
}
