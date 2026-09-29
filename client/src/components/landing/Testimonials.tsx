"use client";

import { Check, Star } from "lucide-react";

const TESTIMONIALS = [
  {
    quote:
      "On other job boards, I sent 120 applications and received 3 automated rejection emails 2 months later. On Credify, I received 3 interview requests in 72 hours, all matching my stated $170k baseline.",
    name: "Marcus R.",
    role: "Staff Distributed Systems",
    initials: "MR",
    avatarBg: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
    badgeText: "Hired @ Linear",
    badgeType: "success",
  },
  {
    quote:
      "The upfront salary transparency saved me dozens of awkward recruiter screens. When a company reached out, their escrow bond was already active and interview stages were confirmed upfront.",
    name: "Sophia L.",
    role: "Lead Frontend Architect",
    initials: "SL",
    avatarBg:
      "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    badgeText: "Hired @ Vercel",
    badgeType: "success",
  },
  {
    quote:
      "As an engineering director, the difference is night and day. Every single candidate on Credify has verified skills and real intent. We filled 3 senior backend roles in under 16 calendar days.",
    name: "Derek Elden",
    role: "VP of Engineering",
    initials: "DE",
    avatarBg: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
    badgeText: "Team Sponsor",
    badgeType: "sponsor",
  },
];

export function Testimonials() {
  return (
    <section
      aria-label="Verified engineer testimonials"
      className="relative py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center rounded-full border border-emerald-500/25 bg-emerald-50 px-3.5 py-1 text-xs font-bold tracking-wider text-emerald-700 uppercase dark:border-emerald-500/30 dark:bg-emerald-950/60 dark:text-emerald-300">
            VERIFIED STORIES
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
            Placed Engineers Speak Up
          </h2>
          <p className="mt-3.5 text-base text-slate-600 dark:text-slate-300">
            Real feedback from engineers who refused ghosting and secured roles
            with locked compensation.
          </p>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <div
              key={item.name}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-7 shadow-xs transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-slate-700"
            >
              <div>
                {/* 5 Stars */}
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="mt-4 text-sm leading-relaxed text-slate-600 italic dark:text-slate-300">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              {/* Author Row */}
              <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${item.avatarBg}`}
                  >
                    {item.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-950 dark:text-white">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.role}
                    </p>
                  </div>
                </div>

                {/* Verified badge */}
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    item.badgeType === "success"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300"
                      : "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/70 dark:text-cyan-300"
                  }`}
                >
                  <Check className="h-3 w-3 stroke-[2.5]" />
                  <span>{item.badgeText}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
