export type CompanySize = "1-10" | "11-50" | "51-200" | "201-1000" | "1000+";
export type CompanyRole = "owner" | "admin" | "member";

export interface Company {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  industry?: string;
  logoUrl?: string;
  logoPublicId?: string;
  websiteUrl?: string;
  size?: CompanySize;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecruiterProfile {
  _id: string;
  userId: string;
  fullName: string;
  title?: string;
  companyId: string | null;
  companyRole: CompanyRole | null;
  createdAt: string;
  updatedAt: string;
}

export const COMPANY_SIZE_OPTIONS: CompanySize[] = [
  "1-10",
  "11-50",
  "51-200",
  "201-1000",
  "1000+",
];
