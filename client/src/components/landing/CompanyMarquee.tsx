"use client";

import {
  Code2,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Globe,
  Terminal,
  Database,
} from "lucide-react";

interface PartnerBrand {
  name: string;
  tagline: string;
  icon: typeof Zap;
}

const PARTNERS: PartnerBrand[] = [
  { name: "Vercel", tagline: "Frontend Cloud", icon: Zap },
  { name: "Linear", tagline: "Product Engine", icon: Layers },
  { name: "Stripe", tagline: "Financial Infrastructure", icon: Globe },
  { name: "Supabase", tagline: "Database & Backend", icon: Database },
  { name: "Datadog", tagline: "Cloud Monitoring", icon: Cpu },
  { name: "Figma", tagline: "Interface Design", icon: Sparkles },
  { name: "GitHub", tagline: "Developer Platform", icon: Terminal },
  { name: "Raycast", tagline: "Productivity", icon: Code2 },
];

export function CompanyMarquee() {
  return (
    <section className="relative border-y border-slate-200/80 bg-slate-50/50 py-10 dark:border-white/5 dark:bg-slate-950/40">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
          Trusted by hiring leaders and engineers at pioneering companies
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-6 sm:gap-10 lg:gap-14">
          {PARTNERS.map(({ name, tagline, icon: Icon }) => (
            <div
              key={name}
              className="group flex items-center gap-2.5 opacity-70 transition-all hover:opacity-100"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200/60 text-slate-700 transition-colors group-hover:bg-cyan-50 group-hover:text-cyan-600 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-cyan-950/50 dark:group-hover:text-cyan-400">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800 transition-colors group-hover:text-slate-950 dark:text-slate-200 dark:group-hover:text-white">
                  {name}
                </span>
                <span className="hidden text-[10px] text-slate-400 sm:inline dark:text-slate-500">
                  {tagline}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
