"use client";

import { Ban, CheckCircle2, DollarSign, Search } from "lucide-react";

const METRICS_DATA = [
  {
    metric: "10,000+",
    title: "Verified Opportunities",
    description:
      "Active positions backed by escrow and engineering leadership sponsorship.",
    icon: Search,
    iconBg: "bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400",
    metricColor: "text-slate-950 dark:text-white",
  },
  {
    metric: "98.4%",
    title: "Candidate Response Rate",
    description:
      "Companies that fail to reply inside 48 hours forfeit platform hiring quota.",
    icon: CheckCircle2,
    iconBg:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
    metricColor: "text-emerald-500 dark:text-emerald-400",
  },
  {
    metric: "$145k",
    title: "Median Verified Compensation",
    description:
      "Audited salary benchmarks with transparent equity and bonus brackets.",
    icon: DollarSign,
    iconBg:
      "bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400",
    metricColor: "text-slate-950 dark:text-white",
  },
  {
    metric: "0%",
    title: "Ghost Jobs or Phantom Listings",
    description:
      "Continuous automated ATS sync unpublishes closed roles instantaneously.",
    icon: Ban,
    iconBg: "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400",
    metricColor: "text-slate-950 dark:text-white",
  },
];

export function TrustMetrics() {
  return (
    <section
      aria-label="Why Candidates and Employers Choose Credify"
      className="relative py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
            Why Candidates & Employers Choose Credify
          </h2>
          <p className="mt-3.5 text-base text-slate-600 dark:text-slate-300">
            Engineered to replace slow recruiter middle-men with transparent,
            deterministic hiring benchmarks.
          </p>
        </div>

        {/* 4 Metrics Cards Grid */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS_DATA.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group relative rounded-2xl border border-slate-200/80 bg-white p-7 shadow-xs transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-slate-700"
              >
                {/* Top-left Icon */}
                <div
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${item.iconBg} mb-5`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Big Metric */}
                <p
                  className={`text-4xl font-extrabold tracking-tight ${item.metricColor}`}
                >
                  {item.metric}
                </p>

                {/* Title */}
                <h3 className="mt-2 text-base font-bold text-slate-950 dark:text-white">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
