import type { JobWithCompany } from "./job";

export interface PublicLandingSummary {
  metrics: {
    publishedJobsCount: number;
    hiringCompaniesCount: number;
    remoteJobsCount: number;
    medianAnnualSalaryInr: number | null;
    salaryListingsCount: number;
  };
  topSkills: Array<{
    skill: string;
    openJobsCount: number;
  }>;
  hiringCompanies: Array<{
    _id: string;
    name: string;
    logoUrl?: string;
    industry?: string;
    openJobsCount: number;
  }>;
  featuredJobs: JobWithCompany[];
}
