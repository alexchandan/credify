import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Cloud,
  Code2,
  Cpu,
  Database,
  Layers,
} from "lucide-react";
import { formatIndianNumber } from "@/lib/formatters";
import type { PublicLandingSummary } from "@/types/landing";

const ICONS = [Code2, Layers, Cpu, Cloud, Database, BarChart3];
const ICON_STYLES = [
  "bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400",
  "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400",
  "bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400",
  "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
  "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",
  "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",
];

function skillLabel(value: string): string {
  return value
    .split(/[\s._-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

interface EngineeringClustersProps {
  skills: PublicLandingSummary["topSkills"];
  isLoading: boolean;
}

export function EngineeringClusters({
  skills,
  isLoading,
}: EngineeringClustersProps) {
  return (
    <section
      aria-label="Skills in demand across live jobs"
      className="relative py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center rounded-full border border-sky-500/25 bg-sky-50 px-3.5 py-1 text-xs font-bold tracking-wider text-sky-700 uppercase dark:border-sky-500/30 dark:bg-sky-950/60 dark:text-sky-300">
              LIVE MARKET DEMAND
            </div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
              Skills employers are hiring for
            </h2>
            <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
              Ranked from the skills attached to currently published jobs.
            </p>
          </div>

          <Link
            href="/jobs"
            className="group inline-flex items-center gap-1.5 self-start text-sm font-semibold text-cyan-700 transition hover:text-cyan-800 sm:self-end dark:text-cyan-400 dark:hover:text-cyan-300"
          >
            <span>View all jobs</span>
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }, (_, index) => (
                <div
                  key={index}
                  className="h-44 animate-pulse rounded-2xl border border-slate-200/80 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
                />
              ))
            : skills.map((item, index) => {
                const Icon = ICONS[index % ICONS.length] ?? Code2;
                const iconStyle = ICON_STYLES[index % ICON_STYLES.length];
                return (
                  <Link
                    key={item.skill}
                    href={`/jobs?skill=${encodeURIComponent(item.skill)}`}
                    className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-slate-700"
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconStyle}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {formatIndianNumber(item.openJobsCount)} open roles
                      </span>
                    </div>

                    <h3 className="mt-5 text-lg font-bold text-slate-950 transition group-hover:text-cyan-600 dark:text-white dark:group-hover:text-cyan-400">
                      {skillLabel(item.skill)}
                    </h3>
                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
                      <span>Explore matching opportunities</span>
                      <ArrowUpRight className="h-4 w-4 text-emerald-600 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-emerald-400" />
                    </div>
                  </Link>
                );
              })}
        </div>

        {!isLoading && skills.length === 0 && (
          <p className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            In-demand skills will appear after jobs are published.
          </p>
        )}
      </div>
    </section>
  );
}
