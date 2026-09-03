import { apiRequest } from "./apiClient";
import type {
  CompanySummary,
  Job,
  JobWithCompany,
  SalaryRange,
} from "@/types/job";

export function formatJobLabel(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function extractSalaryRange(
  jobOrRange?: { salaryRange?: SalaryRange } | SalaryRange | null,
): SalaryRange | undefined {
  if (!jobOrRange) return undefined;
  if ("salaryRange" in jobOrRange) {
    return jobOrRange.salaryRange;
  }
  if ("min" in jobOrRange || "max" in jobOrRange || "currency" in jobOrRange) {
    return jobOrRange as SalaryRange;
  }
  return undefined;
}

export function formatSalary(
  jobOrRange?: { salaryRange?: SalaryRange } | SalaryRange | null,
): string {
  const salaryRange = extractSalaryRange(jobOrRange);
  if (
    !salaryRange ||
    (salaryRange.min === undefined && salaryRange.max === undefined)
  ) {
    return "Salary not disclosed";
  }

  const formatter = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  });
  const min =
    salaryRange.min === undefined ? null : formatter.format(salaryRange.min);
  const max =
    salaryRange.max === undefined ? null : formatter.format(salaryRange.max);
  const amount = min && max ? `${min} - ${max}` : (min ?? max ?? "");
  return `${amount} ${salaryRange.currency ?? "INR"}`.trim();
}

export async function addCompanyNames(
  jobs: Job[],
  signal?: AbortSignal,
): Promise<JobWithCompany[]> {
  const companyIds = [...new Set(jobs.map((job) => job.companyId))];
  const companies = await Promise.all(
    companyIds.map(async (companyId) => {
      try {
        const result = await apiRequest<CompanySummary>(
          `/companies/${companyId}`,
          { skipAuth: true, signal },
        );
        return [companyId, result.data.name] as const;
      } catch {
        return [companyId, "Company unavailable"] as const;
      }
    }),
  );
  const companyNames = new Map(companies);

  return jobs.map((job) => ({
    ...job,
    companyName: companyNames.get(job.companyId) ?? "Company unavailable",
  }));
}
