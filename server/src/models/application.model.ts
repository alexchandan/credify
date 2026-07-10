import mongoose, { Schema } from "mongoose";
import type { Document } from "mongoose";

export enum ApplicationStatus {
  APPLIED = "applied",
  UNDER_REVIEW = "under_review",
  SHORTLISTED = "shortlisted",
  REJECTED = "rejected",
  HIRED = "hired",
  WITHDRAWN = "withdrawn",
}

export interface IStatusHistoryEntry {
  status: ApplicationStatus;
  changedAt: Date;
  changedBy: mongoose.Types.ObjectId; // User — either the candidate (withdrawing) or a recruiter
}

export interface IApplication extends Document {
  candidateId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId; // denormalized from Job, for cheap company-wide recruiter queries
  status: ApplicationStatus;
  resumeSnapshotUrl: string; // resume as it existed at the moment of applying — not a live link
  coverLetter?: string;
  statusHistory: IStatusHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const statusHistoryEntrySchema = new Schema<IStatusHistoryEntry>(
  {
    status: {
      type: String,
      enum: Object.values(ApplicationStatus),
      required: true,
    },
    changedAt: { type: Date, required: true, default: Date.now },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { _id: false },
);

type IApplicationModel = mongoose.Model<IApplication>;

const applicationSchema = new Schema<IApplication, IApplicationModel>(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "CandidateProfile",
      required: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      immutable: true, // an application can't be silently re-pointed to a different job
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      immutable: true,
    },
    status: {
      type: String,
      enum: Object.values(ApplicationStatus),
      default: ApplicationStatus.APPLIED,
    },
    resumeSnapshotUrl: {
      type: String,
      required: [
        true,
        "A resume snapshot is required at the time of application",
      ],
    },
    coverLetter: {
      type: String,
      trim: true,
      maxlength: 3000,
    },
    statusHistory: {
      type: [statusHistoryEntrySchema],
      default: [],
    },
  },
  { timestamps: true },
);

// --- Indexes ---
applicationSchema.index({ candidateId: 1, jobId: 1 }, { unique: true }); // one application per candidate per job
applicationSchema.index({ jobId: 1, status: 1 }); // recruiter reviewing applicants for a specific job
applicationSchema.index({ candidateId: 1, createdAt: -1 }); // candidate's own application history, newest first
applicationSchema.index({ companyId: 1, status: 1 }); // recruiter dashboard — all applications across the company

// --- Record every status change into the audit log automatically ---
applicationSchema.pre(
  "save",
  function (
    this: IApplication & { _statusChangedBy?: mongoose.Types.ObjectId },
  ) {
    if (this.isNew || this.isModified("status")) {
      if (!this._statusChangedBy) {
        throw new Error(
          "applicationDoc._statusChangedBy must be set before save() when status changes — see Application service",
        );
      }
      this.statusHistory.push({
        status: this.status,
        changedAt: new Date(),
        changedBy: this._statusChangedBy,
      });
    }
  },
);

export const Application = mongoose.model<IApplication, IApplicationModel>(
  "Application",
  applicationSchema,
);
