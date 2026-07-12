import { Router } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { validate } from "../../middlewares/validate.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { UserRole } from "../../models/user.model.js";
import * as companyController from "./company.controller.js";
import {
  createCompanySchema,
  updateCompanySchema,
} from "./company.validation.js";

const router: Router = Router();

router.post(
  "/",
  authenticate,
  authorize(UserRole.RECRUITER),
  validate(createCompanySchema),
  catchAsync(companyController.createCompany),
);

// Public — company pages are meant to be discoverable, per the
// public/SEO job-board requirement noted in the architecture doc.
router.get("/:id", catchAsync(companyController.getCompanyById));

router.patch(
  "/:id",
  authenticate,
  authorize(UserRole.RECRUITER),
  validate(updateCompanySchema),
  catchAsync(companyController.updateCompany),
);

export { router as companyRouter };
