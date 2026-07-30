import mongoose from "mongoose";
import type { Document } from "mongoose";

export enum Availability {
  IMMEDIATE = "immediate",
  WITHIN_TWO_WEEKS = "within_two_weeks",
  WITHIN_ONE_MONTH = "within_one_month",
  NOT_LOOKING = "not_looking",
}

// ---- Embedded subdocuments for candidate profile ----
export interface IEducation {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: Date;
  endDate?: Date; // omitted/undefined if currently studying
  grade?: string;
}

export interface IExperience {
  company: string;
  title: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  description?: string;
}

export interface IProject {
  title: string;
  description?: string;
  techStack: string[];
  link?: string;
}

export interface ICertification {
  name: string;
  issuingOrg: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialUrl?: string;
}

export interface ISocialLinks {
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  twitter?: string;
}

export interface ICandidateProfile extends Document {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  headline?: string;
  skills: string[];
  location?: string;
  availability: Availability;
  resumeUrl?: string;
  resumePublicId?: string; //Cloudinary public_id for the current resume
  education: IEducation[];
  experience: IExperience[];
  projects: IProject[];
  certifications: ICertification[];
  socialLinks: ISocialLinks;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ---- Sub-Schemas for embedded documents ----
// { _id: false } because these are pure embedded value objects, not
// independently addressable entities — no need for Mongo to generate
// an _id for each one.

const educationSchema = new mongoose.Schema<IEducation>(
  {
    institution: { type: String, required: true, trim: true },
    degree: { type: String, required: true, trim: true },
    fieldOfStudy: { type: String, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    grade: { type: String, trim: true },
  },
  { _id: false },
);

const experienceSchema = new mongoose.Schema<IExperience>(
  {
    company: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    isCurrent: { type: Boolean, default: false },
    description: { type: String, trim: true, maxlength: 2000 },
  },
  { _id: false },
);

const projectSchema = new mongoose.Schema<IProject>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, maxlength: 2000 },
    techStack: { type: [String], default: [] },
    link: { type: String, trim: true },
  },
  { _id: false },
);

const certificationSchema = new mongoose.Schema<ICertification>(
  {
    name: { type: String, required: true, trim: true },
    issuingOrg: { type: String, required: true, trim: true },
    issueDate: { type: Date, required: true },
    expiryDate: { type: Date },
    credentialUrl: { type: String, trim: true },
  },
  { _id: false },
);

const socialLinksSchema = new mongoose.Schema<ISocialLinks>(
  {
    linkedIn: { type: String, trim: true },
    github: { type: String, trim: true },
    portfolio: { type: String, trim: true },
    twitter: { type: String, trim: true },
  },
  { _id: false },
);

type ICandidateProfileModel = mongoose.Model<ICandidateProfile>;

// ---- Main CandidateProfile Schema ----
const candidateProfileSchema = new mongoose.Schema<
  ICandidateProfile,
  ICandidateProfileModel
>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Each user can have only one candidate profile
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    headline: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    skills: {
      type: [String],
      default: [],
      set: (skills: string[]) =>
        skills.map((skill) => skill.trim().toLowerCase()),
    },
    location: { type: String, trim: true },
    availability: {
      type: String,
      enum: Object.values(Availability),
      default: Availability.NOT_LOOKING,
    },
    resumeUrl: { type: String, trim: true },
    resumePublicId: { type: String, trim: true },
    education: { type: [educationSchema], default: [] },
    experience: { type: [experienceSchema], default: [] },
    projects: { type: [projectSchema], default: [] },
    certifications: { type: [certificationSchema], default: [] },
    socialLinks: { type: socialLinksSchema, default: () => ({}) },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);

// --- Indexes for efficient querying ---
// userId already gets a unique index due to the unique: true option in the schema definition.
candidateProfileSchema.index({ skills: 1 }); // support searching by skills
candidateProfileSchema.index({ location: 1 });
candidateProfileSchema.index({ availability: 1 });
candidateProfileSchema.index({ deletedAt: 1 });

export const CandidateProfile = mongoose.model<
  ICandidateProfile,
  ICandidateProfileModel
>("CandidateProfile", candidateProfileSchema);
