"use client";

import { CheckCircle, Clock4, DollarSign, ShieldCheck } from "lucide-react";

interface MetricItem {
  id: string;
  value: string;
  label: string;
  description: string;
  icon: typeof ShieldCheck;
  accent: string;
}

const METRICS: MetricItem[] = [
  {
    id: "verified-jobs",
    value: "10,000+",
    label: "Verified Opportunities",
    description:
      "Every role is published by an audited team with genuine hiring intent.",
    icon: ShieldCheck,
    accent:
      "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50 border-cyan-200 dark:border-cyan-800/40",
  },
  {
    id: "response-rate",
    value: "98.4%",
    label: "Candidate Response Rate",
    description:
      "Milestone radars hold hiring teams accountable to quick decisions.",
    icon: Clock4,
    accent:
      "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/40",
  },
  {
    id: "median-comp",
    value: "$145k",
    label: "Median Compensation",
    description:
      "Full salary bands posted upfront. No surprises in late round interviews.",
    icon: DollarSign,
    accent:
      "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800/40",
  },
  {
    id: "zero-ghost",
    value: "0%",
    label: "Ghost Jobs or Spam",
    description:
      "Algorithmic screening and employer verification eliminate phantom roles.",
    icon: CheckCircle,
    accent:
      "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-800/40",
  },
];

export function TrustMetrics() {
  return (
    <section className="relative px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold tracking-wider text-cyan-600 uppercase dark:text-cyan-400">
            A hiring market built on trust
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
            Numbers that prove why candidates choose Credify
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
            Traditional job boards profit from volume and phantom listings.
            Credify is engineered around verified proof, prompt feedback, and
            salary transparency.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map(
            ({ id, value, label, description, icon: Icon, accent }) => (
              <div
                key={id}
                className="group relative rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl hover:shadow-cyan-500/5 dark:border-white/10 dark:bg-slate-900 dark:hover:border-cyan-500/50 dark:hover:shadow-cyan-500/10"
              >
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl border ${accent}`}
                >
                  <Icon className="h-6 w-6" />
                </div>

                <div className="mt-5">
                  <p className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                    {value}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-slate-800 dark:text-slate-200">
                    {label}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {description}
                  </p>
                </div>

                {/* Bottom subtle glow line */}
                <div className="absolute inset-x-6 bottom-0 h-0.5 rounded-full bg-transparent transition-all group-hover:bg-linear-to-r group-hover:from-cyan-500 group-hover:to-emerald-400" />
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
