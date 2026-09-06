"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock,
  Code2,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const TRENDING_TAGS = [
  { label: "Full Stack", query: "full stack" },
  { label: "Next.js", query: "next.js" },
  { label: "AI / ML", query: "ai" },
  { label: "Cloud & DevOps", query: "devops" },
  { label: "Product Design", query: "product design" },
  { label: "Remote", query: "remote" },
];

export function Hero() {
  const router = useRouter();
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("");

  function handleSearch(event?: React.SubmitEvent<HTMLFormElement>) {
    if (event) event.preventDefault();
    const params = new URLSearchParams();
    if (keywords.trim()) params.set("q", keywords.trim());
    if (location.trim()) params.set("location", location.trim());
    router.push(`/jobs${params.size ? `?${params}` : ""}`);
  }

  function handleTagClick(query: string) {
    setKeywords(query);
    const params = new URLSearchParams();
    params.set("q", query);
    router.push(`/jobs?${params}`);
  }

  return (
    <section className="relative overflow-hidden pt-8 pb-20 sm:pt-12 sm:pb-28">
      {/* Background Decorative Gradients & Mesh */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 h-125 w-200 -translate-x-1/2 rounded-full bg-linear-to-tr from-cyan-500/10 via-cyan-400/5 to-emerald-400/10 blur-3xl dark:from-cyan-500/15 dark:via-cyan-400/10 dark:to-emerald-400/15" />
        <div className="absolute top-1/3 right-0 h-100 w-100 rounded-full bg-cyan-600/5 blur-3xl dark:bg-cyan-500/10" />
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Headline, Search & Trust Points */}
          <div className="lg:col-span-7">
            {/* Live Verification Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/80 bg-cyan-50/80 px-3.5 py-1.5 text-xs font-semibold text-cyan-800 shadow-xs backdrop-blur-md transition-all hover:bg-cyan-100/80 dark:border-cyan-500/30 dark:bg-cyan-950/50 dark:text-cyan-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="font-medium tracking-wide">
                Credify 2.0 • The Verified Career Network
              </span>
              <Sparkles className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
            </div>

            {/* Main Headline */}
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">
              Where verified talent meets{" "}
              <span className="bg-linear-to-r from-cyan-600 via-cyan-500 to-emerald-500 bg-clip-text text-transparent dark:from-cyan-400 dark:via-cyan-300 dark:to-emerald-400">
                career-defining roles.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
              Cut through ghost listings and automated resume filters. Connect
              directly with hiring teams that publish upfront salaries, verify
              real credentials, and guarantee response timelines.
            </p>

            {/* Search Box Form */}
            <form
              onSubmit={handleSearch}
              role="search"
              className="mt-8 rounded-2xl border border-slate-200/90 bg-white/90 p-2.5 shadow-xl shadow-slate-200/50 backdrop-blur-xl transition-all sm:grid sm:grid-cols-[1fr_0.8fr_auto] sm:gap-2 dark:border-white/10 dark:bg-slate-900/90 dark:shadow-none"
            >
              <div className="relative mb-2 sm:mb-0">
                <span className="sr-only">Job title, skill, or keyword</span>
                <Search
                  className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={keywords}
                  onChange={(event) => setKeywords(event.target.value)}
                  placeholder="Job title, skill, or keyword..."
                  className="h-12 w-full rounded-xl border border-slate-200/80 bg-slate-50/70 pr-3 pl-10 text-sm font-medium text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-cyan-600 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-slate-950/70 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-950 dark:focus:ring-cyan-500/30"
                />
              </div>

              <div className="relative mb-2 sm:mb-0">
                <span className="sr-only">Location</span>
                <MapPin
                  className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Location or 'Remote'..."
                  className="h-12 w-full rounded-xl border border-slate-200/80 bg-slate-50/70 pr-3 pl-10 text-sm font-medium text-slate-950 transition outline-none placeholder:text-slate-400 focus:border-cyan-600 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-slate-950/70 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-950 dark:focus:ring-cyan-500/30"
                />
              </div>

              <button
                type="submit"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-cyan-600 to-cyan-700 px-6 text-sm font-semibold text-white shadow-md shadow-cyan-600/25 transition-all hover:from-cyan-500 hover:to-cyan-600 hover:shadow-lg hover:shadow-cyan-600/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 active:scale-[0.98] sm:w-auto dark:from-cyan-500 dark:to-cyan-600 dark:text-slate-950 dark:hover:from-cyan-400 dark:hover:to-cyan-500"
              >
                <span>Find roles</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>

            {/* Trending Quick Search Chips */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-medium text-slate-500 dark:text-slate-400">
                Trending:
              </span>
              {TRENDING_TAGS.map((tag) => (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => handleTagClick(tag.query)}
                  className="rounded-lg border border-slate-200 bg-slate-100/70 px-2.5 py-1 font-medium text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-800 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-cyan-500/50 dark:hover:bg-cyan-950/40 dark:hover:text-cyan-300"
                >
                  {tag.label}
                </button>
              ))}
            </div>

            {/* Trust Points Badges */}
            <div className="mt-8 grid grid-cols-3 gap-3 border-t border-slate-200/80 pt-6 sm:gap-6 dark:border-white/10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-semibold text-slate-700 sm:text-sm dark:text-slate-200">
                  Zero Ghost Jobs
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 shrink-0 text-cyan-600 dark:text-cyan-400" />
                <span className="text-xs font-semibold text-slate-700 sm:text-sm dark:text-slate-200">
                  100% Upfront Pay
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 shrink-0 text-amber-500 dark:text-amber-400" />
                <span className="text-xs font-semibold text-slate-700 sm:text-sm dark:text-slate-200">
                  48h Avg Response
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: High-Fidelity Glassmorphic Mockup Dashboard */}
          <div className="relative lg:col-span-5">
            {/* Ambient Background Aura behind mockup */}
            <div className="absolute -inset-2 rounded-3xl bg-linear-to-r from-cyan-500/20 via-emerald-500/20 to-sky-500/20 blur-2xl dark:from-cyan-500/25 dark:via-emerald-500/20 dark:to-sky-500/25" />

            <div className="relative rounded-3xl border border-slate-200/90 bg-white/85 p-6 shadow-2xl shadow-slate-300/40 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/85 dark:shadow-cyan-950/40">
              {/* Mockup Header: Verified Candidate Card */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-tr from-cyan-600 to-emerald-500 text-base font-bold text-white shadow-md shadow-cyan-600/20">
                    AR
                    <span className="absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900">
                      <CheckCircle2 className="h-3 w-3 text-white" />
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        Alex Rivera
                      </h3>
                      <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-bold text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300">
                        VERIFIED
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Staff Full-Stack Engineer • San Francisco
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/60 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Actively Interviewing
                </span>
              </div>

              {/* Skills Tags */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {[
                  "Next.js 15",
                  "TypeScript",
                  "Node.js",
                  "PostgreSQL",
                  "System Architecture",
                ].map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:border-white/5 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Live Application Timeline Card */}
              <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/90 p-3.5 dark:border-white/5 dark:bg-slate-950/60">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Application Pipeline Radar
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    98% Role Fit Score
                  </span>
                </div>

                {/* 4-Step Progress Tracker */}
                <div className="mt-3 grid grid-cols-4 gap-1.5 text-center">
                  {[
                    { label: "Submitted", state: "done" },
                    { label: "Screened", state: "done" },
                    { label: "Tech Deep Dive", state: "done" },
                    { label: "Final Offer", state: "active" },
                  ].map((step) => (
                    <div
                      key={step.label}
                      className="flex flex-col items-center"
                    >
                      <div
                        className={`h-1.5 w-full rounded-full transition-all ${
                          step.state === "done"
                            ? "bg-emerald-500"
                            : step.state === "active"
                              ? "animate-pulse bg-cyan-500"
                              : "bg-slate-200 dark:bg-slate-700"
                        }`}
                      />
                      <span className="mt-1.5 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Highlight Card 1: Verified Offer Notification */}
              <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-200/80 bg-emerald-50/90 p-3 text-xs shadow-sm dark:border-emerald-500/20 dark:bg-emerald-950/40">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-xs">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-emerald-950 dark:text-emerald-200">
                      Offer Received • $195,000 / yr
                    </p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      Staff Engineer • 100% Remote • Full Equity
                    </p>
                  </div>
                </div>
                <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase dark:bg-emerald-500">
                  Accepted
                </span>
              </div>

              {/* Mini Footer Metrics in Mockup */}
              <div className="mt-4 flex items-center justify-between pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Code2 className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                  Verified GitHub & Project Proof
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Zero Spam • 100% Vetted
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
