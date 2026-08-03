import { z } from "zod";
import { Availability } from "../../models/candidateProfile.model.js";

const educationSchema = z.object({
  institution: z
    .string()
    .trim()
    .min(1, "Institution is required")
    .max(100, "Institution name is too long"),
  degree: z
    .string()
    .trim()
    .min(1, "Degree is required")
    .max(100, "Degree name is too long"),
  fieldOfStudy: z.string().trim().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  grade: z.string().trim().optional(),
});

const experienceSchema = z.object({
  company: z
    .string()
    .trim()
    .min(1, "Company is required")
    .max(100, "Company name is too long"),
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(100, "Title is too long"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().trim().max(2000).optional(),
});

const projectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Project title is required")
    .max(100, "Title is too long"),
  description: z.string().trim().max(2000).optional(),
  techStack: z.array(z.string().trim()).default([]),
  link: z.url("Invalid URL").optional(),
});

const certificationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Certification name is required")
    .max(100, "Certification name is too long"),
  issuingOrg: z.string().trim().min(1, "Issuing organization is required"),
  issueDate: z.coerce.date(),
  expiryDate: z.coerce.date().optional(),
  credentialUrl: z.url("Invalid URL").optional(),
});

const socialLinksSchema = z.object({
  linkedIn: z.url("Invalid URL").optional(),
  github: z.url("Invalid URL").optional(),
  portfolio: z.url("Invalid URL").optional(),
  twitter: z.url("Invalid URL").optional(),
});

export const createCandidateProfileSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(150),
  headline: z.string().trim().max(150).optional(),
  skills: z.array(z.string().trim().min(1)).default([]),
  location: z.string().trim().optional(),
  availability: z
    .enum(Object.values(Availability) as [Availability, ...Availability[]])
    .optional(),
  education: z.array(educationSchema).default([]),
  experience: z.array(experienceSchema).default([]),
  projects: z.array(projectSchema).default([]),
  certifications: z.array(certificationSchema).default([]),
  socialLinks: socialLinksSchema.optional(),
});

export type CreateCandidateProfileInput = z.infer<
  typeof createCandidateProfileSchema
>;

// Partial — every field optional, since an update may only touch one
// section (e.g. just adding a project) without resending the whole profile.
export const updateCandidateProfileSchema =
  createCandidateProfileSchema.partial();

export type UpdateCandidateProfileInput = z.infer<
  typeof updateCandidateProfileSchema
>;
