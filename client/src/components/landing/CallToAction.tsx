"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

export function CallToAction() {
  return (
    <section className="relative overflow-hidden px-5 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-linear-to-b from-slate-900 via-slate-950 to-slate-950 px-6 py-16 shadow-2xl sm:px-12 sm:py-20 lg:px-16 dark:border-white/10">
          {/* Ambient Glows */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 h-96 w-175 -translate-x-1/2 rounded-full bg-linear-to-r from-cyan-500/30 via-emerald-500/20 to-sky-500/30 blur-3xl"
          />

          <div className="relative mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-950/60 px-4 py-1.5 text-xs font-semibold text-cyan-300 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Join 25,000+ engineers and forward-thinking companies</span>
            </div>

            <h2 className="mt-6 text-3xl leading-tight font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              Ready to experience hiring without the games?
            </h2>

            <p className="mt-5 text-base leading-relaxed text-slate-300 sm:text-lg">
              Say goodbye to ghost jobs, automated resume rejections, and hidden
              salary ranges. Take control of your next career chapter on the
              verified network.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/jobs"
                className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-cyan-400 via-cyan-500 to-emerald-400 px-8 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/25 transition-all hover:opacity-95 hover:shadow-cyan-500/40 active:scale-[0.98] sm:w-auto"
              >
                <span>Explore Verified Opportunities</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/register?role=recruiter"
                className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 text-sm font-bold text-white backdrop-blur-md transition-all hover:border-white/30 hover:bg-white/10 active:scale-[0.98] sm:w-auto"
              >
                <span>Hire Verified Talent</span>
                <Zap className="h-4 w-4 text-cyan-400" />
              </Link>
            </div>

            {/* Guarantee Chips */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-400 sm:gap-8">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>100% Free for candidates</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                <span>Vetted companies only</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>No resume spam</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
