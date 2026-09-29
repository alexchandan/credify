import Image from "next/image";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { formatIndianNumber } from "@/lib/formatters";
import type { PublicLandingSummary } from "@/types/landing";

type HiringCompany = PublicLandingSummary["hiringCompanies"][number];

interface CompanyMarqueeProps {
  companies: PublicLandingSummary["hiringCompanies"];
  isLoading: boolean;
}

function CompanyLink({
  company,
  duplicate = false,
}: {
  company: HiringCompany;
  duplicate?: boolean;
}) {
  return (
    <Link
      href={`/companies/${company._id}`}
      tabIndex={duplicate ? -1 : undefined}
      aria-hidden={duplicate || undefined}
      className="group flex shrink-0 items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-slate-700 shadow-xs transition hover:border-cyan-300 hover:text-slate-950 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-cyan-500/50 dark:hover:text-white"
      aria-label={`${company.name}, ${formatIndianNumber(company.openJobsCount)} open roles`}
    >
      {company.logoUrl ? (
        <Image
          src={company.logoUrl}
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 rounded-lg object-cover"
        />
      ) : (
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-400">
          <Building2 className="h-4 w-4" aria-hidden="true" />
        </span>
      )}
      <span>
        <span className="block text-sm font-semibold tracking-tight whitespace-nowrap">
          {company.name}
        </span>
        <span className="block text-[10px] font-medium whitespace-nowrap text-slate-500 dark:text-slate-400">
          {formatIndianNumber(company.openJobsCount)} open roles
        </span>
      </span>
    </Link>
  );
}

export function CompanyMarquee({ companies, isLoading }: CompanyMarqueeProps) {
  const repetitions =
    companies.length > 0 ? Math.ceil(8 / companies.length) : 0;
  const marqueeCompanies = Array.from(
    { length: repetitions },
    () => companies,
  ).flat();

  return (
    <section
      aria-label="Companies with live opportunities"
      className="relative border-y border-slate-200/80 bg-slate-50/50 py-10 dark:border-white/5 dark:bg-slate-950/40"
    >
      <div className="mx-auto max-w-7xl px-5 text-center sm:px-6 lg:px-8">
        <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase dark:text-slate-500">
          COMPANIES WITH LIVE OPPORTUNITIES
        </p>
      </div>

      <div className="company-marquee-viewport mt-7 overflow-hidden motion-reduce:overflow-x-auto">
        {isLoading ? (
          <div className="flex min-w-max items-center gap-6 px-6">
            {Array.from({ length: 7 }, (_, index) => (
              <span
                key={index}
                className="h-14 w-44 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"
              />
            ))}
          </div>
        ) : marqueeCompanies.length > 0 ? (
          <div className="animate-marquee">
            {[false, true].map((duplicate) => (
              <div
                key={String(duplicate)}
                aria-hidden={duplicate || undefined}
                className="flex shrink-0 items-center gap-6 pr-6"
              >
                {marqueeCompanies.map((company, index) => (
                  <CompanyLink
                    key={`${company._id}-${index}`}
                    company={company}
                    duplicate={duplicate || index >= companies.length}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <p className="px-5 text-center text-sm text-slate-500 dark:text-slate-400">
            Company opportunities will appear here as jobs are published.
          </p>
        )}
      </div>
    </section>
  );
}
