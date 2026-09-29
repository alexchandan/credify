"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  Clock,
  IndianRupee,
  MapPin,
  Search,
  ShieldCheck,
  User,
  Zap,
} from "lucide-react";

const TRENDING_TAGS = [
  { label: "Full-Stack", query: "full stack" },
  { label: "Next.js", query: "next.js" },
  { label: "AI / ML", query: "ai" },
  { label: "Cloud & DevOps", query: "devops" },
  { label: "Product Design", query: "product design" },
  { label: "Remote", query: "remote", hasLightning: true },
];

export function Hero() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"candidates" | "employers">(
    "candidates",
  );
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("");

  function handleSearch(event?: React.SubmitEvent<HTMLFormElement>) {
    if (event) event.preventDefault();
    if (activeTab === "employers") {
      const params = new URLSearchParams();
      if (keywords.trim()) params.set("q", keywords.trim());
      router.push(`/recruiter/candidates${params.size ? `?${params}` : ""}`);
      return;
    }
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
    <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24">
      {/* Background Decorative Grid and Ambient Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-[0.4] dark:opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(14, 165, 233, 0.25) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute top-0 left-1/2 h-110 w-190 -translate-x-1/2 rounded-full bg-linear-to-tr from-cyan-500/10 via-sky-400/5 to-teal-400/10 blur-3xl dark:from-cyan-500/15 dark:via-sky-400/10 dark:to-teal-400/15" />
      </div>

      <div className="mx-auto max-w-5xl px-5 text-center sm:px-6 lg:px-8">
        {/* Main Headline */}
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">
          Where verified talent meets
          <br className="hidden sm:inline" />{" "}
          <span className="bg-linear-to-r from-sky-600 via-cyan-500 to-teal-400 bg-clip-text text-transparent dark:from-sky-400 dark:via-cyan-300 dark:to-teal-300">
            career-defining roles.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
          Cut through ghost listings and automated resume filters. Connect
          directly with hiring teams that publish upfront salaries, verify real
          credentials, and guarantee response timelines.
        </p>

        {/* Segmented Mode Switcher */}
        <div className="mt-8 inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-slate-100/90 p-1.5 shadow-inner backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
          <button
            type="button"
            onClick={() => setActiveTab("candidates")}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold transition-all sm:text-sm ${
              activeTab === "candidates"
                ? "bg-white text-slate-950 shadow-xs dark:bg-slate-800 dark:text-white"
                : "text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <User className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>For Candidates</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("employers")}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold transition-all sm:text-sm ${
              activeTab === "employers"
                ? "bg-white text-slate-950 shadow-xs dark:bg-slate-800 dark:text-white"
                : "text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Building2 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span>For Employers</span>
          </button>
        </div>

        {/* Unified Search Box Container */}
        <form
          onSubmit={handleSearch}
          role="search"
          className="mx-auto mt-6 max-w-3xl rounded-2xl border border-slate-200/90 bg-white p-2.5 shadow-xl shadow-slate-200/50 backdrop-blur-xl transition-all focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 sm:flex sm:items-center sm:gap-2 sm:rounded-full sm:p-2 dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-none"
        >
          <div className="relative flex flex-1 items-center px-3.5 py-2.5 sm:py-0">
            <Search
              className="mr-3 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500"
              aria-hidden="true"
            />
            <input
              type="search"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder={
                activeTab === "candidates"
                  ? "Job title, tech stack (e.g. Next.js, Rust, ML Infra)..."
                  : "Search candidate skills (e.g. React, Distributed Systems)..."
              }
              className="w-full bg-transparent text-sm font-medium text-slate-950 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>

          <div className="hidden h-7 w-px shrink-0 bg-slate-200 sm:block dark:bg-slate-700" />

          <div className="relative flex items-center px-3.5 py-2.5 sm:w-64 sm:py-0">
            <MapPin
              className="mr-3 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500"
              aria-hidden="true"
            />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location or 'Remote'"
              className="w-full bg-transparent text-sm font-medium text-slate-950 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>

          <button
            type="submit"
            className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-cyan-600/25 transition-all hover:bg-cyan-500 hover:shadow-lg hover:shadow-cyan-600/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 active:scale-[0.98] sm:w-auto sm:rounded-full"
          >
            <span>
              {activeTab === "candidates" ? "Find roles" : "Search talent"}
            </span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>

        {/* Quick Filter / Trending Tags */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="font-medium text-slate-400 dark:text-slate-500">
            Trending:
          </span>
          {TRENDING_TAGS.map((tag) => (
            <button
              key={tag.label}
              type="button"
              onClick={() => handleTagClick(tag.query)}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 font-medium text-slate-700 shadow-2xs transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-800 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-cyan-500/40 dark:hover:bg-cyan-950/40 dark:hover:text-cyan-300"
            >
              {tag.hasLightning && (
                <Zap className="h-3 w-3 fill-amber-400 text-amber-500" />
              )}
              <span>{tag.label}</span>
            </button>
          ))}
        </div>

        {/* 3 Trust Highlight Cards Below Search */}
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Badge 1: Zero Ghost Jobs */}
          <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white/80 p-4 text-left shadow-xs backdrop-blur-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-slate-700">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-950 dark:text-white">
                Zero Ghost Jobs
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                100% API-verified active teams
              </p>
            </div>
          </div>

          {/* Badge 2: 100% Upfront Pay */}
          <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white/80 p-4 text-left shadow-xs backdrop-blur-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-slate-700">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <IndianRupee className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-950 dark:text-white">
                100% Upfront Pay
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Exact salary bands guaranteed
              </p>
            </div>
          </div>

          {/* Badge 3: < 48h Response SLA */}
          <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white/80 p-4 text-left shadow-xs backdrop-blur-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-slate-700">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-950 dark:text-white">
                &lt; 48h Response SLA
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct employer feedback limit
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
