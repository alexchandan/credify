import mongoose from "mongoose";
import type { Document } from "mongoose";

export enum ActivityAction {
  USER_REGISTERED = "user_registered",
  USER_MODERATED = "user_moderated",
  COMPANY_CREATED = "company_created",
  COMPANY_UPDATED = "company_updated",
  JOB_PUBLISHED = "job_published",
  JOB_CLOSED = "job_closed",
  JOB_DELETED = "job_deleted",
  APPLICATION_STATUS_CHANGED = "application_status_changed",
  RECRUITER_REMOVED_FROM_COMPANY = "recruiter_removed_from_company",
}

export enum ActivityTargetType {
  USER = "User",
  COMPANY = "Company",
  JOB = "Job",
  APPLICATION = "Application",
  RECRUITER_PROFILE = "RecruiterProfile",
}

export interface IActivityLog extends Document {
  actorId: mongoose.Types.ObjectId; // the User who performed the action
  action: ActivityAction;
  targetType: ActivityTargetType;
  targetId: mongoose.Types.ObjectId;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: Date;
}

type IActivityLogModel = mongoose.Model<IActivityLog>;

const activityLogSchema = new mongoose.Schema<IActivityLog, IActivityLogModel>(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    action: {
      type: String,
      enum: Object.values(ActivityAction),
      required: true,
      immutable: true,
    },
    targetType: {
      type: String,
      enum: Object.values(ActivityTargetType),
      required: true,
      immutable: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "targetType",
      immutable: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      immutable: true,
    },
    ipAddress: {
      type: String,
      immutable: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // no updatedAt — this collection is never updated
  },
);

// --- Indexes ---
activityLogSchema.index({ actorId: 1, createdAt: -1 }); // "everything this user did"
activityLogSchema.index({ targetType: 1, targetId: 1, createdAt: -1 }); // "full history for this entity"
activityLogSchema.index({ action: 1, createdAt: -1 }); // admin filtering by action type

// --- Hard block on any attempt to modify an existing log entry ---
activityLogSchema.pre(
  ["findOneAndUpdate", "updateOne", "updateMany"],
  function () {
    throw new Error("ActivityLog entries are immutable and cannot be updated");
  },
);

export const ActivityLog = mongoose.model<IActivityLog, IActivityLogModel>(
  "ActivityLog",
  activityLogSchema,
);
