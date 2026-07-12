import { Router } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { validate } from "../../middlewares/validate.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { UserRole } from "../../models/user.model.js";
import * as searchController from "./search.controller.js";
import {
  searchCandidatesQuerySchema,
  searchJobsQuerySchema,
} from "./search.validation.js";

const router: Router = Router();

// Recruiter/admin-only — matches where "Candidate Search" lives in the
// original feature spec (Recruiter module), not a public capability.
router.get(
  "/candidates",
  authenticate,
  authorize(UserRole.RECRUITER, UserRole.ADMIN),
  validate(searchCandidatesQuerySchema, "query"),
  catchAsync(searchController.searchCandidates),
);

// Public — same audience as the existing public job listing endpoint.
router.get(
  "/jobs",
  validate(searchJobsQuerySchema, "query"),
  catchAsync(searchController.searchJobs),
);

export { router as searchRouter };
