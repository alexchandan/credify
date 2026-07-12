import mongoose from "mongoose";
import type { Document } from "mongoose";

export enum CompanySize {
  MICRO = "1-10",
  SMALL = "11-50",
  MEDIUM = "51-200",
  LARGE = "201-1000",
  ENTERPRISE = "1000+",
}

export interface ICompany extends Document {
  name: string;
  slug: string;
  description?: string;
  industry?: string;
  logoUrl?: string;
  websiteUrl?: string;
  size?: CompanySize;
  createdBy: mongoose.Types.ObjectId;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ICompanyModel = mongoose.Model<ICompany>;

export const companySchema = new mongoose.Schema<ICompany, ICompanyModel>(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      minlength: [2, "Company name must be at least 2 characters long"],
      maxlength: [100, "Company name must be at most 100 characters long"],
    },

    slug: {
      type: String,
      required: [true, "Company slug is required"],
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [
        3000,
        "Company description must be at most 3000 characters long",
      ],
    },

    industry: {
      type: String,
      trim: true,
    },

    logoUrl: {
      type: String,
      trim: true,
    },

    websiteUrl: {
      type: String,
      trim: true,
    },

    size: {
      type: String,
      enum: Object.values(CompanySize),
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecruiterProfile",
      required: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// ---- Indexes ----
companySchema.index(
  { slug: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } },
);
companySchema.index({ name: "text" }); // support text search on company name
companySchema.index({ deletedAt: 1 });

export const Company = mongoose.model<ICompany, ICompanyModel>(
  "Company",
  companySchema,
);
