"use client";

import {
  SiCloudflare,
  SiFigma,
  SiGithub,
  SiLinear,
  SiNotion,
  SiStripe,
  SiSupabase,
  SiVercel,
} from "react-icons/si";

const TRUSTED_ORGANIZATIONS = [
  { name: "Stripe", icon: SiStripe, iconClass: "text-[#635BFF]" },
  { name: "Linear", icon: SiLinear, iconClass: "text-[#5E6AD2]" },
  {
    name: "Vercel",
    icon: SiVercel,
    iconClass: "text-slate-900 dark:text-white",
  },
  { name: "Supabase", icon: SiSupabase, iconClass: "text-[#3ECF8E]" },
  { name: "Figma", icon: SiFigma, iconClass: "text-[#F24E1E]" },
  {
    name: "GitHub",
    icon: SiGithub,
    iconClass: "text-slate-900 dark:text-white",
  },
  { name: "Cloudflare", icon: SiCloudflare, iconClass: "text-[#F38020]" },
  {
    name: "Notion",
    icon: SiNotion,
    iconClass: "text-slate-900 dark:text-white",
  },
];

export function CompanyMarquee() {
  return (
    <section
      aria-label="Trusted by engineering organizations"
      className="relative border-y border-slate-200/80 bg-slate-50/50 py-10 dark:border-white/5 dark:bg-slate-950/40"
    >
      <div className="mx-auto max-w-7xl px-5 text-center sm:px-6 lg:px-8">
        <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase dark:text-slate-500">
          TRUSTED BY 500+ ENGINEERING-LED ORGANIZATIONS
        </p>

        {/* Desktop static centered row & Mobile smooth marquee */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-8 sm:gap-12 lg:gap-14">
          {TRUSTED_ORGANIZATIONS.map((company) => {
            const Icon = company.icon;
            return (
              <div
                key={company.name}
                className="group flex items-center gap-2 text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition ${company.iconClass}`}
                />
                <span className="text-sm font-semibold tracking-tight">
                  {company.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
