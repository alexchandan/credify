import { Router } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { validate } from "../../middlewares/validate.js";
import { authenticate } from "../../middlewares/authenticate.js";
import * as notificationController from "./notification.controller.js";
import { notificationListQuerySchema } from "./notification.validation.js";

const router: Router = Router();

// No authorize(role) — every authenticated role (candidate, recruiter,
// admin) can have notifications; there's nothing role-specific here.
router.use(authenticate);

router.get(
  "/me",
  validate(notificationListQuerySchema, "query"),
  catchAsync(notificationController.getMyNotifications),
);

router.patch("/read-all", catchAsync(notificationController.markAllAsRead));
router.patch("/:id/read", catchAsync(notificationController.markAsRead));

router.get("/stream", notificationController.streamNotifications);

export { router as notificationRouter };
