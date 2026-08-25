import mongoose from "mongoose";
import type { Document } from "mongoose";

export enum JobStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  CLOSED = "closed",
}

export enum EmploymentType {
  FULL_TIME = "full_time",
  PART_TIME = "part_time",
  CONTRACT = "contract",
  INTERNSHIP = "internship",
}

export enum ExperienceLevel {
  ENTRY = "entry",
  MID = "mid",
  SENIOR = "senior",
  LEAD = "lead",
}

export interface isSalaryRange {
  min?: number;
  max?: number;
  currency: string;
}

export interface IJob extends Document {
  companyId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId; // Recruiter Profile - Permanent, independent of their current company
  title: string;
  description: string;
  status: JobStatus;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  skillsRequired: string[];
  location?: string[];
  isRemote: boolean;
  salaryRange?: isSalaryRange;
  publishedAt: Date | null;
  applicationCount: number;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

type IJobModel = mongoose.Model<IJob>;

const salaryRangeSchema = new mongoose.Schema<isSalaryRange>(
  {
    min: { type: Number, min: 0 },
    max: { type: Number, min: 0 },
    currency: { type: String, default: "INR", uppercase: true, trim: true },
  },
  { _id: false },
);

const jobSchema = new mongoose.Schema<IJob, IJobModel>(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecruiterProfile",
      required: true,
      immutable: true, // authership never changes after creation, even if the recruiter switches companies later
    },

    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      required: [true, "Job Description is required"],
      trim: true,
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: Object.values(JobStatus),
      default: JobStatus.DRAFT,
    },

    employmentType: {
      type: String,
      enum: Object.values(EmploymentType),
      required: true,
    },

    experienceLevel: {
      type: String,
      enum: Object.values(ExperienceLevel),
      required: true,
    },

    skillsRequired: {
      type: [String],
      default: [],
      set: (skills: string[]) => skills.map((s) => s.trim().toLowerCase()),
    },

    location: {
      type: [String],
      default: [],
      set: (locations: string[]) =>
        locations.map((location) => location.trim().toLowerCase()),
    },

    isRemote: {
      type: Boolean,
      default: false,
    },

    salaryRange: {
      type: salaryRangeSchema,
      default: undefined, // Optional - recruiters may choose not to disclose
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    applicationCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// ---- Indexes ----
jobSchema.index({ companyId: 1, status: 1 }); // All published jobs for this company
jobSchema.index({ status: 1, publishedAt: -1 }); // Public job feed, newest first
jobSchema.index({ skillsRequired: 1 }); // multikey - skill-based filtering
jobSchema.index({ location: 1 });
jobSchema.index({ createdBy: 1 });
jobSchema.index({ isDeleted: 1 });
jobSchema.index({ title: "text", description: "text", skillsRequired: "text" }); // fallback text search before Atlas Search is introduced

// check publishedAt modification
jobSchema.pre("save", function (this: IJob) {
  if (
    this.isModified("status") &&
    this.status === JobStatus.PUBLISHED &&
    !this.publishedAt
  ) {
    this.publishedAt = new Date();
  }
});

export const Job = mongoose.model<IJob, IJobModel>("Job", jobSchema);
