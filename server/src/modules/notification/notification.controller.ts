import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import * as notificationService from "./notification.service.js";
import type { NotificationListQuery } from "./notification.validation.js";

export async function getMyNotifications(
  req: Request,
  res: Response,
): Promise<void> {
  const query = req.query as unknown as NotificationListQuery;
  const result = await notificationService.getMyNotifications(
    req.user!.userId,
    query,
  );
  sendSuccess(res, {
    data: result.notifications,
    meta: {
      page: result.page,
      limit: result.limit,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      unreadCount: result.unreadCount,
    },
  });
}

export async function markAsRead(req: Request, res: Response): Promise<void> {
  const notification = await notificationService.markAsRead(
    req.user!.userId,
    req.params.id as string,
  );
  sendSuccess(res, { data: notification, message: "Marked as read" });
}

export async function markAllAsRead(
  req: Request,
  res: Response,
): Promise<void> {
  const result = await notificationService.markAllAsRead(req.user!.userId);
  sendSuccess(res, {
    data: result,
    message: "All notifications marked as read",
  });
}
