import mongoose from "mongoose";
import type { Document } from "mongoose";

export enum NotificationType {
  APPLICATION_RECEIVED = "application_received", // recruiter: new application on their job
  APPLICATION_STATUS_CHANGED = "application_status_changed", // candidate: status update
  JOB_PUBLISHED = "job_published",
  CANDIDATE_SAVED = "candidate_saved",
}

export enum RelatedEntityType {
  JOB = "Job",
  APPLICATION = "Application",
  CANDIDATE_PROFILE = "CandidateProfile",
}

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId; // the recipient
  type: NotificationType;
  message: string;
  relatedEntityType?: RelatedEntityType;
  relatedEntityId?: mongoose.Types.ObjectId;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

type INotificationModel = mongoose.Model<INotification>;

const notificationSchema = new mongoose.Schema<
  INotification,
  INotificationModel
>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    relatedEntityType: {
      type: String,
      enum: Object.values(RelatedEntityType),
    },
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "relatedEntityType", // dynamic ref — resolves to Job/Application/CandidateProfile based on relatedEntityType
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// --- Indexes ---
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 }); // "my unread notifications, newest first" — the dashboard's core query
notificationSchema.index({ userId: 1, createdAt: -1 }); // full notification history, paginated

// --- Keep isRead and readAt consistent with each other ---
notificationSchema.pre("save", function (this: INotification) {
  if (this.isModified("isRead") && this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
});

export const Notification = mongoose.model<INotification, INotificationModel>(
  "Notification",
  notificationSchema,
);
