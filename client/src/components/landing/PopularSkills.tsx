"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cloud, Code2, Database, Palette } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";

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
    accent: "bg-orange-50 text-orange-700",
  },
  {
    skill: "sql",
    label: "SQL & Data",
    icon: Database,
    accent: "bg-sky-50 text-sky-700",
  },
  {
    skill: "figma",
    label: "Product Design",
    icon: Palette,
    accent: "bg-rose-50 text-rose-700",
  },
  {
    skill: "aws",
    label: "Cloud & AWS",
    icon: Cloud,
    accent: "bg-emerald-50 text-emerald-700",
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
    <section className="bg-slate-50 px-5 py-14 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold text-orange-700">
          Explore by skill
        </p>
        <h2 className="mt-1 text-2xl font-bold text-slate-950">
          Popular job categories
        </h2>

        <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {SKILLS.map(({ skill, label, icon: Icon, accent }) => {
            const count = counts[skill];
            return (
              <Link
                key={skill}
                href={`/jobs?skill=${encodeURIComponent(skill)}`}
                className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-4 text-center transition hover:border-orange-300 hover:shadow-sm sm:p-6"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${accent}`}
                >
                  <Icon className="h-6 w-6" strokeWidth={2} />
                </div>
                <h3 className="mt-3 text-base font-semibold text-slate-900">
                  {label}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
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
