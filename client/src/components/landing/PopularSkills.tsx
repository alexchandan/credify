"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cloud, Code2, Database, Palette } from "lucide-react";
import { API_BASE_URL as API_BASE } from "@/lib/apiBaseUrl";

interface ApiListMeta {
  totalCount: number;
}

// A curated subset of the skill pool your seed script actually uses —
// counts below are fetched live, never hardcoded, so this stays accurate
// as real job postings are added or removed.
const SKILLS = [
  {
    skill: "javascript",
    label: "JavaScript",
    icon: Code2,
    accent:
      "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400",
  },
  {
    skill: "sql",
    label: "SQL & Data",
    icon: Database,
    accent: "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300",
  },
  {
    skill: "figma",
    label: "Product Design",
    icon: Palette,
    accent: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300",
  },
  {
    skill: "aws",
    label: "Cloud & AWS",
    icon: Cloud,
    accent:
      "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400",
  },
];

export function PopularSkills() {
  const [counts, setCounts] = useState<Record<string, number | null>>({});

  useEffect(() => {
    let cancelled = false;

    async function loadCounts() {
      const results = await Promise.all(
        SKILLS.map(async ({ skill }) => {
          try {
            const res = await fetch(
              `${API_BASE}/jobs?skill=${encodeURIComponent(skill)}&limit=1`,
            );
            const json = (await res.json()) as {
              success: boolean;
              meta?: ApiListMeta;
            };
            return [
              skill,
              json.success ? (json.meta?.totalCount ?? 0) : null,
            ] as const;
          } catch {
            return [skill, null] as const;
          }
        }),
      );
      if (!cancelled) {
        setCounts(Object.fromEntries(results));
      }
    }

    loadCounts();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="bg-slate-50 px-5 py-14 sm:px-6 dark:bg-slate-900">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">
          Explore by skill
        </p>
        <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">
          Popular job categories
        </h2>

        <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {SKILLS.map(({ skill, label, icon: Icon, accent }) => {
            const count = counts[skill];
            return (
              <Link
                key={skill}
                href={`/jobs?skill=${encodeURIComponent(skill)}`}
                className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-4 text-center transition hover:border-orange-300 hover:shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-orange-600"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${accent}`}
                >
                  <Icon className="h-6 w-6" strokeWidth={2} />
                </div>
                <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-100">
                  {label}
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {count === null
                    ? "Unavailable"
                    : count === undefined
                      ? "Loading..."
                      : `${count} Job${count === 1 ? "" : "s"}`}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
