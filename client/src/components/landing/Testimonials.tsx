"use client";

import { CheckCircle2, Star } from "lucide-react";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  metric: string;
  initials: string;
  accent: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Credify completely eliminated the worst part of job hunting—the endless void of unanswered applications. Having real-time milestone radar and knowing the exact salary before applying felt like a breath of fresh air.",
    author: "Maya Chen",
    role: "Staff Frontend Architect",
    company: "Hired at Linear via Credify",
    metric: "+35% compensation • Offer in 12 days",
    initials: "MC",
    accent: "from-cyan-500 to-blue-600",
  },
  {
    quote:
      "As a hiring manager, our inbound on standard boards was 95% AI-generated spam. On Credify, every candidate's GitHub and technical credentials were verified. We closed two critical senior distributed systems roles in 3 weeks.",
    author: "David Vance",
    role: "VP of Engineering",
    company: "Supabase Ecosystem Team",
    metric: "65% faster hiring cycle • 0 spam applicants",
    initials: "DV",
    accent: "from-emerald-500 to-teal-600",
  },
  {
    quote:
      "No awkward salary negotiation games where companies lowball you at the end. The pay was right on the job card, verified by leadership. The technical interview was respectful, prompt, and directly evaluated my actual code.",
    author: "Elena Rostova",
    role: "Senior AI / ML Engineer",
    company: "Hired at Frontier AI Labs",
    metric: "$215k base + equity • Verified role",
    initials: "ER",
    accent: "from-purple-500 to-pink-600",
  },
];

export function Testimonials() {
  return (
    <section className="relative px-5 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold tracking-wider text-cyan-600 uppercase dark:text-cyan-400">
            Real Stories, Real Careers
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
            Loved by engineers and visionary hiring teams
          </h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base dark:text-slate-300">
            Read how professionals accelerated their careers and how engineering
            teams found top tier talent with zero ghosting.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          {TESTIMONIALS.map(
            ({ quote, author, role, company, metric, initials, accent }) => (
              <div
                key={author}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl dark:border-white/10 dark:bg-slate-900 dark:hover:border-cyan-500/50"
              >
                <div>
                  {/* 5-star Rating */}
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>

                  <p className="mt-5 text-sm leading-relaxed text-slate-700 italic dark:text-slate-300">
                    &ldquo;{quote}&rdquo;
                  </p>
                </div>

                <div className="mt-8 border-t border-slate-100 pt-5 dark:border-white/5">
                  {/* Highlight Metric Pill */}
                  <div className="mb-4 inline-flex items-center gap-1 rounded-full border border-emerald-300/60 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <CheckCircle2 className="h-3 w-3" />
                    {metric}
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-tr ${accent} text-sm font-bold text-white shadow-xs`}
                    >
                      {initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {author}
                        </h3>
                        <span className="py-0.2 rounded-full bg-cyan-100 px-1.5 text-[9px] font-extrabold text-cyan-800 dark:bg-cyan-950/70 dark:text-cyan-300">
                          VERIFIED
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        {role}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">
                        {company}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
