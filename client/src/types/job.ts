export interface SalaryRange {
  min?: number;
  max?: number;
  currency?: string;
}

export interface Job {
  _id: string;
  companyId: string;
  title: string;
  description: string;
  status: "draft" | "published" | "closed";
  employmentType: "full_time" | "part_time" | "contract" | "internship";
  experienceLevel: "entry" | "mid" | "senior" | "lead";
  skillsRequired: string[];
  location: string[];
  isRemote: boolean;
  salaryRange?: SalaryRange;
  publishedAt?: string | null;
  applicationCount: number;
}

export interface JobWithCompany extends Job {
  companyName: string;
}

export interface CompanySummary {
  _id: string;
  name: string;
  industry?: string;
  logoUrl?: string;
}
