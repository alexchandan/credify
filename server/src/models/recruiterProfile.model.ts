import mongoose from "mongoose";
import type { Document } from "mongoose";

export enum CompanyRole {
  OWNER = "owner", // Created the company - full permissions
  ADMIN = "admin", // Can manage users, edit company details, and post jobs
  MEMBER = "member", // can manage their own job postings only
}

export interface IRecruiterProfile extends Document {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  title?: string;
  companyId: mongoose.Types.ObjectId | null; // null until they created/join a company
  companyRole: CompanyRole | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

type IRecruiterProfileModel = mongoose.Model<IRecruiterProfile>;

const recruiterProfileSchema = new mongoose.Schema<IRecruiterProfile>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },

    title: {
      type: String,
      trim: true,
    },

    companyId: {
      type: mongoose.Types.ObjectId,
      ref: "Company",
      default: null,
    },

    companyRole: {
      type: String,
      enum: Object.values(CompanyRole),
      default: null,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// ---- Indexes ----
recruiterProfileSchema.index({ companyId: 1 }); // list all recruiters for this company
recruiterProfileSchema.index({ deletedAt: 1 });

// ---- Guard: companyRole should never be set without a companyId ----
recruiterProfileSchema.pre("validate", function (this: IRecruiterProfile) {
  if (this.companyRole && !this.companyId) {
    this.invalidate(
      "companyId",
      "companyId is required when companyRole is provided",
    );
  }

  if (this.companyId && !this.companyRole) {
    this.invalidate(
      "companyRole",
      "companyRole is required when companyId is provided",
    );
  }
});

export const RecruiterProfile = mongoose.model<
  IRecruiterProfile,
  IRecruiterProfileModel
>("RecruiterProfile", recruiterProfileSchema);
