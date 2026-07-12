import {
  Notification,
  type INotification,
} from "../../models/notification.model.js";
import { AppError } from "../../utils/AppError.js";
import type { NotificationListQuery } from "./notification.validation.js";

interface NotificationListResult {
  notifications: INotification[];
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  unreadCount: number;
}

export async function getMyNotifications(
  userId: string,
  query: NotificationListQuery,
): Promise<NotificationListResult> {
  const filter: Record<string, unknown> = { userId };
  if (query.isRead !== undefined) filter.isRead = query.isRead;

  const skip = (query.page - 1) * query.limit;

  const [notifications, totalCount, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit),
    Notification.countDocuments(filter),
    // Always the TRUE unread count regardless of the isRead filter applied
    // above — this is what a notification bell badge actually needs,
    // independent of whichever filtered view the list itself is showing.
    Notification.countDocuments({ userId, isRead: false }),
  ]);

  return {
    notifications,
    page: query.page,
    limit: query.limit,
    totalCount,
    totalPages: Math.ceil(totalCount / query.limit),
    unreadCount,
  };
}

export async function markAsRead(
  userId: string,
  notificationId: string,
): Promise<INotification> {
  const notification = await Notification.findOne({
    _id: notificationId,
    userId,
  });
  if (!notification) {
    throw new AppError(404, "NOTIFICATION_404", "Notification not found");
  }

  notification.isRead = true; // pre('save') hook stamps readAt
  await notification.save();

  return notification;
}

export async function markAllAsRead(
  userId: string,
): Promise<{ modifiedCount: number }> {
  // Bulk update, not a loop of .save() calls — this deliberately bypasses
  // the isRead/readAt pre('save') hook (which only runs on individual
  // document saves), so readAt is stamped directly in the update itself.
  const result = await Notification.updateMany(
    { userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } },
  );

  return { modifiedCount: result.modifiedCount };
}
