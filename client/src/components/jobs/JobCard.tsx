import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, MapPin, Wallet } from "lucide-react";
import { formatJobLabel, formatSalary } from "@/lib/jobData";
import type { JobWithCompany } from "@/types/job";

export function JobCard({ job }: { job: JobWithCompany }) {
  const location = job.isRemote
    ? "Remote"
    : job.location.join(", ") || "Location not specified";

  return (
    <article className="group flex h-full flex-col rounded-xl border border-slate-200/90 bg-white p-5 transition-all hover:border-cyan-300 hover:shadow-lg hover:shadow-cyan-500/5 dark:border-white/10 dark:bg-slate-900 dark:hover:border-cyan-500/60 dark:hover:shadow-cyan-500/10">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-200/80 bg-cyan-50/90 text-cyan-700 shadow-xs dark:border-cyan-900/40 dark:bg-cyan-950/50 dark:text-cyan-400">
          <BriefcaseBusiness className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="rounded-full border border-emerald-300/60 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-[#8ff0c1]">
          {formatJobLabel(job.employmentType)}
        </span>
      </div>

      <h3 className="mt-4 text-base font-semibold text-slate-950 dark:text-white">
        <Link
          href={`/jobs/${job._id}`}
          className="transition hover:text-cyan-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 dark:hover:text-cyan-400"
        >
          {job.title}
        </Link>
      </h3>
      <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
        {job.companyName}
      </p>

      <dl className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
        <div className="flex items-start gap-2">
          <MapPin
            className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500"
            aria-hidden="true"
          />
          <dt className="sr-only">Location</dt>
          <dd className="line-clamp-2">{location}</dd>
        </div>
        <div className="flex items-start gap-2">
          <Wallet
            className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500"
            aria-hidden="true"
          />
          <dt className="sr-only">Salary</dt>
          <dd>{formatSalary(job)}</dd>
        </div>
      </dl>

      <div className="mt-auto pt-5">
        <Link
          href={`/jobs/${job._id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-700 transition group-hover:text-cyan-800 dark:text-cyan-400 dark:group-hover:text-cyan-300"
        >
          View job
          <ArrowUpRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>
    </article>
  );
}
