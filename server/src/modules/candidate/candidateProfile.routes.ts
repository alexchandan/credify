import { Router } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { validate } from "../../middlewares/validate.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { avatarUpload, resumeUpload } from "../../middlewares/upload.js";
import { UserRole } from "../../models/user.model.js";
import * as candidateProfileController from "./candidateProfile.controller.js";
import { updateCandidateProfileSchema } from "./candidateProfile.validation.js";

const router: Router = Router();

router.get(
  "/me",
  authenticate,
  authorize(UserRole.CANDIDATE),
  catchAsync(candidateProfileController.getMyProfile),
);

router.patch(
  "/me",
  authenticate,
  authorize(UserRole.CANDIDATE),
  validate(updateCandidateProfileSchema),
  catchAsync(candidateProfileController.updateMyProfile),
);

router.post(
  "/me/resume",
  authenticate,
  authorize(UserRole.CANDIDATE),
  resumeUpload,
  catchAsync(candidateProfileController.uploadResume),
);

router.delete(
  "/me/resume",
  authenticate,
  authorize(UserRole.CANDIDATE),
  catchAsync(candidateProfileController.deleteResume),
);

router.post(
  "/me/avatar",
  authenticate,
  authorize(UserRole.CANDIDATE),
  avatarUpload,
  catchAsync(candidateProfileController.uploadAvatar),
);

router.delete(
  "/me/avatar",
  authenticate,
  authorize(UserRole.CANDIDATE),
  catchAsync(candidateProfileController.deleteAvatar),
);

// Recruiter/admin-facing read of a specific candidate.
router.get(
  "/:id",
  authenticate,
  authorize(UserRole.RECRUITER, UserRole.ADMIN),
  catchAsync(candidateProfileController.getCandidateById),
);

export { router as candidateRouter };
