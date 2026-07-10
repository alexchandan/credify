import mongoose from "mongoose";
import type { Document } from "mongoose";

export interface ISavedCandidate extends Document {
  recruiterId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

type ISavedCandidateModel = mongoose.Model<ISavedCandidate>;

const savedCandidateSchema = new mongoose.Schema<
  ISavedCandidate,
  ISavedCandidateModel
>(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecruiterProfile",
      required: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CandidateProfile",
      required: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true },
);

// --- Indexes ---
savedCandidateSchema.index(
  { recruiterId: 1, candidateId: 1 },
  { unique: true },
);
savedCandidateSchema.index({ recruiterId: 1, createdAt: -1 }); // "my saved list, most recent first"

export const SavedCandidate = mongoose.model<
  ISavedCandidate,
  ISavedCandidateModel
>("SavedCandidate", savedCandidateSchema);
