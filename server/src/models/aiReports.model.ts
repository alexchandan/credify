import mongoose from "mongoose";
import type { Document } from "mongoose";

export enum AIReportType {
  RESUME_PARSE = "resume_parse",
  RESUME_REVIEW = "resume_review",
  CANDIDATE_MATCH = "candidate_match",
  PROFILE_IMPROVEMENT = "profile_improvement",
}

export enum AIReportStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface IAIReport extends Document {
  candidateId: mongoose.Types.ObjectId;
  jobId?: mongoose.Types.ObjectId; // only present for CANDIDATE_MATCH
  type: AIReportType;
  status: AIReportStatus;
  result?: Record<string, unknown>;
  error?: string;
  requestedBy: mongoose.Types.ObjectId; // User who triggered this — candidate themself, or a recruiter (for matching)
  createdAt: Date;
  updatedAt: Date;
}

type IAIReportModel = mongoose.Model<IAIReport>;

const aiReportSchema = new mongoose.Schema<IAIReport, IAIReportModel>(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CandidateProfile",
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
    type: {
      type: String,
      enum: Object.values(AIReportType),
      required: true,
      immutable: true,
    },
    status: {
      type: String,
      enum: Object.values(AIReportStatus),
      default: AIReportStatus.PENDING,
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
    },
    error: {
      type: String,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
  },
  { timestamps: true },
);

// --- Indexes ---
aiReportSchema.index({ candidateId: 1, type: 1, createdAt: -1 }); // "this candidate's report history by type"
aiReportSchema.index({ jobId: 1, type: 1 }); // "all match reports for this job" (recruiter view)
aiReportSchema.index({ status: 1 }); // worker/ops queries — "find all stuck pending reports"

// --- CANDIDATE_MATCH must have a jobId; other types must not ---
aiReportSchema.pre("validate", function (this: IAIReport) {
  const requiresJob = this.type === AIReportType.CANDIDATE_MATCH;
  if (requiresJob && !this.jobId) {
    throw new Error("jobId is required for CANDIDATE_MATCH reports");
  }
  if (!requiresJob && this.jobId) {
    throw new Error(`jobId must not be set for report type "${this.type}"`);
  }
});

export const AIReport = mongoose.model<IAIReport, IAIReportModel>(
  "AIReport",
  aiReportSchema,
);
