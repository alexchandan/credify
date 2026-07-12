import { Router } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { validate } from "../../middlewares/validate.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { UserRole } from "../../models/user.model.js";
import * as savedCandidateController from "./savedCandidate.controller.js";
import {
  saveCandidateSchema,
  updateSavedCandidateSchema,
  savedCandidateListQuerySchema,
} from "./savedCandidate.validation.js";

const router: Router = Router();

router.use(authenticate, authorize(UserRole.RECRUITER));

router.post(
  "/",
  validate(saveCandidateSchema),
  catchAsync(savedCandidateController.saveCandidate),
);

router.get(
  "/me",
  validate(savedCandidateListQuerySchema, "query"),
  catchAsync(savedCandidateController.getMySavedCandidates),
);

router.patch(
  "/:id",
  validate(updateSavedCandidateSchema),
  catchAsync(savedCandidateController.updateSavedCandidate),
);

router.delete("/:id", catchAsync(savedCandidateController.unsaveCandidate));

export { router as savedCandidateRouter };
