import { Router } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { validate } from "../../middlewares/validate.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { UserRole } from "../../models/user.model.js";
import * as adminController from "./admin.controller.js";
import {
  userListQuerySchema,
  moderateUserSchema,
  companyListQuerySchema,
  jobListQuerySchema,
} from "./admin.validation.js";

const router: Router = Router();

// Every route in this module is admin-only.
router.use(authenticate, authorize(UserRole.ADMIN));

router.get(
  "/users",
  validate(userListQuerySchema, "query"),
  catchAsync(adminController.listUsers),
);
router.patch(
  "/users/:id/moderate",
  validate(moderateUserSchema),
  catchAsync(adminController.moderateUser),
);

router.get(
  "/companies",
  validate(companyListQuerySchema, "query"),
  catchAsync(adminController.listCompanies),
);
router.delete("/companies/:id", catchAsync(adminController.deleteCompany));

router.get(
  "/jobs",
  validate(jobListQuerySchema, "query"),
  catchAsync(adminController.listJobs),
);
router.delete("/jobs/:id", catchAsync(adminController.deleteJob));

export { router as adminRouter };
