import { z } from "zod";
import { CompanySize } from "../../models/company.model.js";

export const createCompanySchema = z.object({
  name: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(100)
    .trim(),
  description: z.string().max(3000).trim().optional(),
  industry: z.string().trim().optional(),
  logoUrl: z.string().url("Invalid URL").optional(),
  websiteUrl: z.string().url("Invalid URL").optional(),
  size: z
    .enum(Object.values(CompanySize) as [CompanySize, ...CompanySize[]])
    .optional(),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;

export const updateCompanySchema = createCompanySchema.partial();

export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
