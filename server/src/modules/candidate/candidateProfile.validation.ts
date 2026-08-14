import { z } from "zod";
import { Availability } from "../../models/candidateProfile.model.js";

const optionalText = (maxLength: number) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().max(maxLength).optional(),
  );

const optionalUrl = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? undefined : value,
  z.url("Invalid URL").optional(),
);

const optionalDate = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.date().optional(),
);

function validateDateRange(
  value: { startDate: Date; endDate?: Date | undefined },
  ctx: z.RefinementCtx,
  endDatePath = "endDate",
): void {
  if (value.endDate && value.endDate < value.startDate) {
    ctx.addIssue({
      code: "custom",
      path: [endDatePath],
      message: "End date cannot be before start date",
    });
  }
}

const educationSchema = z
  .object({
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
    fieldOfStudy: optionalText(100),
    startDate: z.coerce.date(),
    endDate: optionalDate,
    grade: optionalText(50),
  })
  .superRefine(validateDateRange);

const experienceSchema = z
  .object({
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
    endDate: optionalDate,
    isCurrent: z.boolean().default(false),
    description: optionalText(2000),
  })
  .superRefine(validateDateRange);

const projectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Project title is required")
    .max(100, "Title is too long"),
  description: optionalText(2000),
  techStack: z
    .array(z.string().trim().min(1).max(50))
    .max(30)
    .transform((items) => [...new Set(items.map((item) => item.toLowerCase()))])
    .default([]),
  link: optionalUrl,
});

const certificationSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Certification name is required")
      .max(100, "Certification name is too long"),
    issuingOrg: z
      .string()
      .trim()
      .min(1, "Issuing organization is required")
      .max(100),
    issueDate: z.coerce.date(),
    expiryDate: optionalDate,
    credentialUrl: optionalUrl,
  })
  .superRefine((value, ctx) =>
    validateDateRange(
      { startDate: value.issueDate, endDate: value.expiryDate },
      ctx,
      "expiryDate",
    ),
  );

const socialLinksSchema = z.object({
  linkedIn: optionalUrl,
  github: optionalUrl,
  portfolio: optionalUrl,
  twitter: optionalUrl,
});

export const createCandidateProfileSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(150),
  headline: optionalText(150),
  skills: z
    .array(z.string().trim().min(1).max(50))
    .max(50)
    .transform((items) => [...new Set(items.map((item) => item.toLowerCase()))])
    .default([]),
  location: optionalText(100),
  availability: z
    .enum(Object.values(Availability) as [Availability, ...Availability[]])
    .optional(),
  education: z.array(educationSchema).max(20).default([]),
  experience: z.array(experienceSchema).max(30).default([]),
  projects: z.array(projectSchema).max(30).default([]),
  certifications: z.array(certificationSchema).max(30).default([]),
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
