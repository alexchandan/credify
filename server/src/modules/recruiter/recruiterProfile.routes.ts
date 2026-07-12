import { Router } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { validate } from "../../middlewares/validate.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { UserRole } from "../../models/user.model.js";
import * as recruiterProfileController from "./recruiterProfile.controller.js";
import { updateRecruiterProfileSchema } from "./recruiterProfile.validation.js";

const router: Router = Router();

router.get(
  "/me",
  authenticate,
  authorize(UserRole.RECRUITER),
  catchAsync(recruiterProfileController.getMyProfile),
);

router.patch(
  "/me",
  authenticate,
  authorize(UserRole.RECRUITER),
  validate(updateRecruiterProfileSchema),
  catchAsync(recruiterProfileController.updateMyProfile),
);

router.post(
  "/me/leave-company",
  authenticate,
  authorize(UserRole.RECRUITER),
  catchAsync(recruiterProfileController.leaveCompany),
);

export { router as recruiterRouter };
