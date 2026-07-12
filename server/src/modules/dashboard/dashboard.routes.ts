import { Router } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { UserRole } from "../../models/user.model.js";
import * as dashboardController from "./dashboard.controller.js";

const router: Router = Router();

router.use(authenticate);

router.get(
  "/candidate",
  authorize(UserRole.CANDIDATE),
  catchAsync(dashboardController.getCandidateDashboard),
);

router.get(
  "/recruiter",
  authorize(UserRole.RECRUITER),
  catchAsync(dashboardController.getRecruiterDashboard),
);

router.get(
  "/admin",
  authorize(UserRole.ADMIN),
  catchAsync(dashboardController.getAdminDashboard),
);

export { router as dashboardRouter };
