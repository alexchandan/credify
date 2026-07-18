"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";

export function Hero() {
  const router = useRouter();
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keywords) params.set("skill", keywords);
    if (location) params.set("location", location);
    router.push(`/jobs${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <section className="bg-gradient-to-b from-slate-50 to-white px-6 pt-16 pb-14 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
        Find your next career move
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-base text-slate-500 sm:text-lg">
        Browse real, verified job postings from real companies. Track every
        application in real time, from submission to decision.
      </p>

      <form
        onSubmit={handleSearch}
        className="mx-auto mt-8 flex max-w-3xl flex-col gap-2 rounded-full border border-slate-200 bg-white p-2 shadow-sm sm:flex-row sm:items-center"
      >
        <div className="flex flex-1 items-center gap-2 px-4 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="Job title, keywords, or skill"
            className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
        <div className="hidden h-6 w-px bg-slate-200 sm:block" />
        <div className="flex flex-1 items-center gap-2 px-4 py-2.5">
          <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City or Remote"
            className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-blue-700 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800"
        >
          Search Jobs
        </button>
      </form>
    </section>
  );
}
