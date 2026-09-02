"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, Search } from "lucide-react";
import heroImage from "@/../public/credify-hero.png";

export function Hero() {
  const router = useRouter();
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("");

  function handleSearch(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (keywords.trim()) params.set("q", keywords.trim());
    if (location.trim()) params.set("location", location.trim());
    router.push(`/jobs${params.size ? `?${params}` : ""}`);
  }

  return (
    <section className="relative flex min-h-135 items-center overflow-hidden sm:min-h-125">
      <Image
        src={heroImage}
        alt="Two professionals reviewing an opportunity together"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[62%_center] sm:object-center"
      />
      <div className="absolute inset-0 bg-white/80 sm:bg-white/30 dark:bg-slate-950/85 dark:sm:bg-slate-950/75" />

      <div className="relative mx-auto w-full max-w-6xl px-5 py-12 sm:px-6">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/40 bg-emerald-50/90 px-3.5 py-1 text-xs font-semibold tracking-wide text-emerald-700 shadow-sm backdrop-blur-sm dark:border-emerald-500/30 dark:bg-emerald-950/50 dark:text-[#8ff0c1]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#38d996]" />
            Verified opportunities
          </span>
          <h1 className="mt-4 text-4xl leading-tight font-extrabold tracking-tight text-slate-950 sm:text-5xl dark:text-white">
            Find work that moves you forward
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-slate-700 sm:text-lg dark:text-slate-300">
            Search real roles from growing companies and keep every application
            organized from submission to decision.
          </p>

          <form
            onSubmit={handleSearch}
            role="search"
            className="mt-8 grid gap-2.5 rounded-xl border border-slate-200/90 bg-white/95 p-2.5 shadow-lg shadow-slate-200/40 backdrop-blur-xl sm:grid-cols-[1fr_0.8fr_auto] dark:border-white/10 dark:bg-slate-900/95 dark:shadow-none"
          >
            <label className="relative">
              <span className="sr-only">Job title, skill, or keyword</span>
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                aria-hidden="true"
              />
              <input
                type="search"
                value={keywords}
                onChange={(event) => setKeywords(event.target.value)}
                placeholder="Title, skill, or keyword"
                className="h-11 w-full rounded-lg border border-slate-200/80 bg-slate-50/70 pr-3 pl-9 text-sm text-slate-950 transition outline-none focus:border-cyan-600 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 dark:border-transparent dark:bg-slate-950/80 dark:text-white dark:focus:bg-slate-950 dark:focus:ring-cyan-500/30"
              />
            </label>
            <label className="relative">
              <span className="sr-only">Location</span>
              <MapPin
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                aria-hidden="true"
              />
              <input
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="City or remote"
                className="h-11 w-full rounded-lg border border-slate-200/80 bg-slate-50/70 pr-3 pl-9 text-sm text-slate-950 transition outline-none focus:border-cyan-600 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 dark:border-transparent dark:bg-slate-950/80 dark:text-white dark:focus:bg-slate-950 dark:focus:ring-cyan-500/30"
              />
            </label>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-linear-to-r from-cyan-600 via-cyan-600 to-cyan-700 px-6 text-sm font-semibold text-white shadow-md shadow-cyan-600/20 transition hover:from-cyan-500 hover:to-cyan-600 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 active:scale-[0.99] dark:from-cyan-500 dark:via-cyan-500 dark:to-cyan-600 dark:text-slate-950 dark:shadow-cyan-500/25 dark:hover:from-cyan-400 dark:hover:to-cyan-500"
            >
              Search jobs
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
