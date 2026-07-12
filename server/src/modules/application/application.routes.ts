import { Router } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { validate } from "../../middlewares/validate.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { UserRole } from "../../models/user.model.js";
import * as applicationController from "./application.controller.js";
import {
  applyToJobSchema,
  updateApplicationStatusSchema,
  applicationListQuerySchema,
} from "./application.validation.js";

const router: Router = Router();

router.post(
  "/",
  authenticate,
  authorize(UserRole.CANDIDATE),
  validate(applyToJobSchema),
  catchAsync(applicationController.applyToJob),
);

router.get(
  "/me",
  authenticate,
  authorize(UserRole.CANDIDATE),
  validate(applicationListQuerySchema, "query"),
  catchAsync(applicationController.getMyApplications),
);

router.get(
  "/job/:jobId",
  authenticate,
  authorize(UserRole.RECRUITER),
  validate(applicationListQuerySchema, "query"),
  catchAsync(applicationController.getApplicationsForJob),
);

// Shared between candidate (own application) and recruiter (at the owning
// company) — canViewApplication/canUpdateApplicationStatus do the actual
// fine-grained check; authorize here just admits both roles at all.
router.get(
  "/:id",
  authenticate,
  authorize(UserRole.CANDIDATE, UserRole.RECRUITER),
  catchAsync(applicationController.getApplicationById),
);

router.patch(
  "/:id/status",
  authenticate,
  authorize(UserRole.CANDIDATE, UserRole.RECRUITER),
  validate(updateApplicationStatusSchema),
  catchAsync(applicationController.updateApplicationStatus),
);

export { router as applicationRouter };
