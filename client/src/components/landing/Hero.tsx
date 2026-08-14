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
    <section className="relative flex min-h-[540px] items-center overflow-hidden sm:min-h-[500px]">
      <Image
        src={heroImage}
        alt="Two professionals reviewing an opportunity together"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[62%_center] sm:object-center"
      />
      <div className="absolute inset-0 bg-white/80 sm:bg-white/25" />

      <div className="relative mx-auto w-full max-w-6xl px-5 py-12 sm:px-6">
        <div className="max-w-xl">
          <p className="text-sm font-bold text-orange-700">
            Verified opportunities
          </p>
          <h1 className="mt-3 text-4xl leading-tight font-extrabold text-slate-950 sm:text-5xl">
            Find work that moves you forward
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-slate-700 sm:text-lg">
            Search real roles from growing companies and keep every application
            organized from submission to decision.
          </p>

          <form
            onSubmit={handleSearch}
            role="search"
            className="mt-7 grid gap-2 rounded-lg border border-slate-200 bg-white/95 p-2 shadow-sm sm:grid-cols-[1fr_0.8fr_auto]"
          >
            <label className="relative">
              <span className="sr-only">Job title, skill, or keyword</span>
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={keywords}
                onChange={(event) => setKeywords(event.target.value)}
                placeholder="Title, skill, or keyword"
                className="h-11 w-full rounded-md border border-transparent bg-slate-50 pr-3 pl-9 text-sm text-slate-950 outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
              />
            </label>
            <label className="relative">
              <span className="sr-only">Location</span>
              <MapPin
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="City or remote"
                className="h-11 w-full rounded-md border border-transparent bg-slate-50 pr-3 pl-9 text-sm text-slate-950 outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
              />
            </label>
            <button
              type="submit"
              className="h-11 rounded-md bg-orange-600 px-5 text-sm font-semibold text-white transition hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
            >
              Search jobs
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
