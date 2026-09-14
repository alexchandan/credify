"use client";

import Link from "next/link";
import { CheckCircle2, ShieldCheck, Sparkles, Zap } from "lucide-react";
import {
  SiAirbnb,
  SiAtlassian,
  SiCloudflare,
  SiDatadog,
  SiDocker,
  SiFigma,
  SiGithub,
  SiLinear,
  SiNotion,
  SiPrisma,
  SiRaycast,
  SiRedis,
  SiSnowflake,
  SiStripe,
  SiSupabase,
  SiVercel,
} from "react-icons/si";
import type { IconType } from "react-icons";

interface PartnerBrand {
  name: string;
  tagline: string;
  category: string;
  icon: IconType;
  isHiring?: boolean;
}

const ROW_1_PARTNERS: PartnerBrand[] = [
  {
    name: "Vercel",
    tagline: "Frontend Cloud",
    category: "Cloud & Web",
    icon: SiVercel,
    isHiring: true,
  },
  {
    name: "Stripe",
    tagline: "Financial Infrastructure",
    category: "Fintech",
    icon: SiStripe,
    isHiring: true,
  },
  {
    name: "Linear",
    tagline: "Product Engine",
    category: "DevTools",
    icon: SiLinear,
  },
  {
    name: "Supabase",
    tagline: "Backend & Postgres",
    category: "Database",
    icon: SiSupabase,
    isHiring: true,
  },
  {
    name: "Figma",
    tagline: "Interface Design",
    category: "Design",
    icon: SiFigma,
  },
  {
    name: "GitHub",
    tagline: "Developer Platform",
    category: "DevOps",
    icon: SiGithub,
    isHiring: true,
  },
  {
    name: "Raycast",
    tagline: "Supercharged Tools",
    category: "Productivity",
    icon: SiRaycast,
  },
  {
    name: "Docker",
    tagline: "Container Runtime",
    category: "Infrastructure",
    icon: SiDocker,
    isHiring: true,
  },
];

const ROW_2_PARTNERS: PartnerBrand[] = [
  {
    name: "Cloudflare",
    tagline: "Connectivity Cloud",
    category: "Security",
    icon: SiCloudflare,
    isHiring: true,
  },
  {
    name: "Notion",
    tagline: "Connected Workspace",
    category: "Collaboration",
    icon: SiNotion,
  },
  {
    name: "Datadog",
    tagline: "Cloud Monitoring",
    category: "Observability",
    icon: SiDatadog,
    isHiring: true,
  },
  {
    name: "Redis",
    tagline: "Real-Time Data",
    category: "Cache & Data",
    icon: SiRedis,
  },
  {
    name: "Prisma",
    tagline: "Next-Gen ORM",
    category: "Data Layer",
    icon: SiPrisma,
    isHiring: true,
  },
  {
    name: "Snowflake",
    tagline: "Data Cloud",
    category: "Analytics",
    icon: SiSnowflake,
  },
  {
    name: "Airbnb",
    tagline: "Global Hospitality",
    category: "Consumer Tech",
    icon: SiAirbnb,
    isHiring: true,
  },
  {
    name: "Atlassian",
    tagline: "Team Collaboration",
    category: "Enterprise",
    icon: SiAtlassian,
  },
];

function PartnerCard({
  partner,
  isClone = false,
}: {
  partner: PartnerBrand;
  isClone?: boolean;
}) {
  const Icon = partner.icon;

  return (
    <Link
      href={`/jobs?q=${encodeURIComponent(partner.name)}`}
      tabIndex={isClone ? -1 : 0}
      aria-hidden={isClone}
      className="group relative flex items-center gap-2.5 rounded-xl border border-slate-200/90 bg-white/80 px-3 py-2 shadow-xs backdrop-blur-xs transition-all duration-300 hover:scale-[1.03] hover:border-cyan-500/50 hover:bg-white hover:shadow-lg hover:shadow-cyan-500/10 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-500 sm:gap-3.5 sm:rounded-2xl sm:px-4.5 sm:py-3 dark:border-white/10 dark:bg-slate-900/60 dark:hover:border-cyan-400/50 dark:hover:bg-slate-900/95 dark:hover:shadow-cyan-500/10"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition-all duration-300 group-hover:rotate-3 group-hover:bg-cyan-50 group-hover:text-cyan-600 sm:h-10 sm:w-10 sm:rounded-xl dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-cyan-950/60 dark:group-hover:text-cyan-400">
        <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 sm:h-5 sm:w-5" />
      </div>

      <div className="flex flex-col text-left whitespace-nowrap">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-xs font-semibold tracking-tight text-slate-800 transition-colors duration-200 group-hover:text-cyan-600 sm:text-sm dark:text-slate-100 dark:group-hover:text-cyan-400">
            {partner.name}
          </span>
          {partner.isHiring && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-medium text-emerald-600 sm:text-[10px] dark:bg-emerald-400/15 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Hiring
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-500 transition-colors duration-200 sm:text-[11px] dark:text-slate-400">
          {partner.tagline}
        </span>
      </div>
    </Link>
  );
}

export function CompanyMarquee() {
  return (
    <section className="relative overflow-hidden border-y border-slate-200/80 bg-slate-50/70 py-8 sm:py-12 dark:border-white/5 dark:bg-slate-950/60">
      {/* Background Ambience Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
      >
        <div className="h-40 w-full max-w-4xl rounded-full bg-linear-to-r from-cyan-500/5 via-emerald-500/5 to-cyan-500/5 blur-3xl sm:h-48 dark:from-cyan-500/10 dark:via-emerald-500/10 dark:to-cyan-500/10" />
      </div>

      <div className="mx-auto mb-6 max-w-7xl px-4 text-center sm:mb-8 sm:px-6 lg:px-8">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-50/80 px-2.5 py-1 text-[11px] font-semibold text-cyan-700 shadow-xs backdrop-blur-xs sm:gap-2 sm:px-3 sm:py-1 sm:text-xs dark:border-cyan-400/20 dark:bg-cyan-950/40 dark:text-cyan-300">
          <Sparkles className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
          <span>TRUSTED TECH ECOSYSTEM</span>
        </div>

        {/* Heading */}
        <h2 className="mt-2.5 text-lg font-bold tracking-tight text-slate-900 sm:mt-3 sm:text-2xl dark:text-white">
          Where Top Talent & Pioneering Teams Connect
        </h2>
        <p className="mx-auto mt-1 max-w-2xl px-4 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
          Over 500+ engineering-led organizations discover, verify, and hire
          exceptional builders on Credify.
        </p>
      </div>

      {/* Marquee Container with Responsive Side Gradient Fade Overlays */}
      <div className="relative w-full overflow-hidden">
        {/* Left and Right Fade Overlays with Responsive Width */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-10 bg-linear-to-r from-slate-50/95 via-slate-50/70 to-transparent sm:w-28 md:w-36 lg:w-44 dark:from-slate-950/95 dark:via-slate-950/70 dark:to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-10 bg-linear-to-l from-slate-50/95 via-slate-50/70 to-transparent sm:w-28 md:w-36 lg:w-44 dark:from-slate-950/95 dark:via-slate-950/70 dark:to-transparent"
        />

        {/* Track 1 (Leftward scroll) */}
        <div className="animate-marquee py-1.5 sm:py-2">
          <div className="flex shrink-0 items-center gap-3 pr-3 sm:gap-5 sm:pr-5 lg:gap-6 lg:pr-6">
            {ROW_1_PARTNERS.map((partner) => (
              <PartnerCard key={partner.name} partner={partner} />
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-3 pr-3 sm:gap-5 sm:pr-5 lg:gap-6 lg:pr-6">
            {ROW_1_PARTNERS.map((partner) => (
              <PartnerCard
                key={`${partner.name}-clone`}
                partner={partner}
                isClone
              />
            ))}
          </div>
        </div>

        {/* Track 2 (Rightward scroll) */}
        <div className="animate-marquee-reverse mt-1 py-1.5 sm:mt-1.5 sm:py-2">
          <div className="flex shrink-0 items-center gap-3 pr-3 sm:gap-5 sm:pr-5 lg:gap-6 lg:pr-6">
            {ROW_2_PARTNERS.map((partner) => (
              <PartnerCard key={partner.name} partner={partner} />
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-3 pr-3 sm:gap-5 sm:pr-5 lg:gap-6 lg:pr-6">
            {ROW_2_PARTNERS.map((partner) => (
              <PartnerCard
                key={`${partner.name}-clone`}
                partner={partner}
                isClone
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Trust Micro-Bar */}
      <div className="mx-auto mt-6 max-w-7xl px-4 sm:mt-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-3.5 text-[11px] font-medium text-slate-500 sm:gap-6 sm:text-xs lg:gap-10 dark:text-slate-400">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500 sm:h-4 sm:w-4" />
            <span>100% Audited Hiring Roles</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Zap className="h-3.5 w-3.5 shrink-0 text-cyan-500 sm:h-4 sm:w-4" />
            <span>&lt; 48hr Average First Response</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-teal-500 sm:h-4 sm:w-4" />
            <span>Zero Ghost Postings Guaranteed</span>
          </div>
        </div>
      </div>
    </section>
  );
}
