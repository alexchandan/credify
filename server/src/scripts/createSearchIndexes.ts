// Creates the Atlas Search indexes the Search module's $search queries
// depend on. This is a ONE-TIME infrastructure step, not something that
// happens automatically via Mongoose schemas — Atlas Search indexes are a
// genuinely different system from regular MongoDB indexes and can only be
// created via the Atlas UI or, as done here, the driver's
// createSearchIndex() method (requires an Atlas cluster; this will not
// work against a plain self-hosted MongoDB).
//
// Run with: pnpm search:setup
//
// Indexes take a few minutes to finish building on Atlas after this
// script completes — $search queries against a still-building index may
// return incomplete results in the meantime.

import mongoose from "mongoose";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { CandidateProfile } from "../models/candidateProfile.model.js";
import { Job } from "../models/job.model.js";

export const CANDIDATE_SEARCH_INDEX = "candidate_search";
export const JOB_SEARCH_INDEX = "job_search";

// Typed from Mongoose's OWN exposed `.collection` property, rather than
// importing Collection from the `mongodb` package directly — this project
// standardizes on Mongoose as the data-access layer. createSearchIndex()
// has no Mongoose-level equivalent (Atlas Search indexes are a different
// system from regular Mongoose/MongoDB indexes and schema.index() has no
// API for them), so this reaches through Model.collection — which Mongoose
// itself provides — rather than reaching around Mongoose entirely.
type SearchableCollection = typeof CandidateProfile.collection;

async function createIndexIfMissing(
  collection: SearchableCollection,
  name: string,
  definition: Record<string, unknown>,
): Promise<void> {
  try {
    await collection.createSearchIndex({ name, definition });
    logger.info(
      `Created Atlas Search index "${name}" on ${collection.collectionName}`,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (
      message.includes("already exists") ||
      message.includes("IndexAlreadyExists")
    ) {
      logger.info(`Atlas Search index "${name}" already exists — skipping`);
      return;
    }
    throw err;
  }
}

async function main(): Promise<void> {
  await mongoose.connect(env.mongodbUri);
  logger.info("Connected to MongoDB for Atlas Search index setup");

  await createIndexIfMissing(
    CandidateProfile.collection,
    CANDIDATE_SEARCH_INDEX,
    {
      mappings: {
        dynamic: false,
        fields: {
          fullName: { type: "string" },
          headline: { type: "string" },
          skills: { type: "string" },
          location: { type: "string" },
          availability: { type: "string" },
        },
      },
    },
  );

  await createIndexIfMissing(Job.collection, JOB_SEARCH_INDEX, {
    mappings: {
      dynamic: false,
      fields: {
        title: { type: "string" },
        description: { type: "string" },
        skillsRequired: { type: "string" },
        location: { type: "string" },
        employmentType: { type: "string" },
        experienceLevel: { type: "string" },
      },
    },
  });

  logger.info(
    "Done. Indexes may take a few minutes to finish building on Atlas before search queries return complete results.",
  );

  await mongoose.disconnect();
  process.exit(0);
}

// Guarded so importing this module for its constants (as search.service.ts
// does) doesn't also trigger the script — only running it directly (`pnpm
// search:setup`) should connect, create indexes, and exit the process.
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  main().catch((err) => {
    logger.error({ err }, "Search index setup failed");
    process.exit(1);
  });
}
