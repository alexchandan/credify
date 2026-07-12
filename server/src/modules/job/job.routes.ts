import { Router } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { validate } from "../../middlewares/validate.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { optionalAuthenticate } from "../../middlewares/optionalAuthenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { UserRole } from "../../models/user.model.js";
import * as jobController from "./job.controller.js";
import {
  createJobSchema,
  updateJobSchema,
  jobListQuerySchema,
} from "./job.validation.js";

const router: Router = Router();

router.post(
  "/",
  authenticate,
  authorize(UserRole.RECRUITER),
  validate(createJobSchema),
  catchAsync(jobController.createJob),
);

// Public job feed — published jobs only.
router.get(
  "/",
  validate(jobListQuerySchema, "query"),
  catchAsync(jobController.listJobs),
);

// Public for published/closed jobs; drafts require optionalAuthenticate
// so canManageJob has a req.user to check against when one is present.
router.get("/:id", optionalAuthenticate, catchAsync(jobController.getJobById));

router.patch(
  "/:id",
  authenticate,
  authorize(UserRole.RECRUITER),
  validate(updateJobSchema),
  catchAsync(jobController.updateJob),
);

router.patch(
  "/:id/publish",
  authenticate,
  authorize(UserRole.RECRUITER),
  catchAsync(jobController.publishJob),
);

router.patch(
  "/:id/close",
  authenticate,
  authorize(UserRole.RECRUITER),
  catchAsync(jobController.closeJob),
);

router.delete(
  "/:id",
  authenticate,
  authorize(UserRole.RECRUITER),
  catchAsync(jobController.deleteJob),
);

export { router as jobRouter };
