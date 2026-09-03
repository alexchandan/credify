import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import * as notificationService from "./notification.service.js";
import { registerSseClient } from "./realtime.service.js";
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

export function streamNotifications(req: Request, res: Response): void {
  const userId = req.user!.userId;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const cleanup = registerSseClient(userId, res);

  const heartbeat = setInterval(() => {
    try {
      res.write(": keep-alive\n\n");
    } catch {
      clearInterval(heartbeat);
    }
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    cleanup();
  });
}
