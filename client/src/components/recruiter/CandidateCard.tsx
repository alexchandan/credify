"use client";

import {
  MapPin,
  Clock,
  Briefcase,
  Bookmark,
  FileText,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import type { CandidateProfile } from "@/types/candidate";
import { AVAILABILITY_OPTIONS } from "@/types/candidate";

interface CandidateCardProps {
  candidate: CandidateProfile;
  isSaved?: boolean;
  savedNote?: string;
  onViewProfile: (candidate: CandidateProfile) => void;
  onToggleSave: (candidate: CandidateProfile) => void;
}

export function CandidateCard({
  candidate,
  isSaved = false,
  savedNote = "",
  onViewProfile,
  onToggleSave,
}: CandidateCardProps) {
  const availabilityLabel =
    AVAILABILITY_OPTIONS.find((opt) => opt.value === candidate.availability)
      ?.label ?? "Available";

  const availabilityColorMap: Record<string, string> = {
    immediate:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60",
    within_two_weeks:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60",
    within_one_month:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60",
    not_looking:
      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  };

  const initials = candidate.fullName
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const latestExp = candidate.experience?.[0];

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md sm:p-6 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      <div>
        {/* Top bar: Avatar, Name, Availability, Bookmark */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            {candidate.avatarUrl ? (
              <div className="relative h-13 w-13 shrink-0 overflow-hidden rounded-2xl border border-slate-100 shadow-xs dark:border-slate-800">
                <Image
                  src={candidate.avatarUrl}
                  alt={candidate.fullName}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-linear-to-tr from-cyan-600 to-blue-600 text-base font-bold text-white shadow-xs">
                {initials}
              </div>
            )}
            <div>
              <h3
                onClick={() => onViewProfile(candidate)}
                className="cursor-pointer text-base font-bold text-slate-950 transition hover:text-cyan-600 dark:text-white dark:hover:text-cyan-400"
              >
                {candidate.fullName}
              </h3>
              <p className="mt-0.5 line-clamp-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                {candidate.headline || "Talented Candidate"}
              </p>
            </div>
          </div>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(candidate);
            }}
            title={
              isSaved
                ? "Saved candidate (Click to manage)"
                : "Save candidate to talent pool"
            }
            className={`rounded-xl p-2 transition ${
              isSaved
                ? "bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:hover:bg-amber-900/60"
                : "text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Badges row */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
              availabilityColorMap[candidate.availability] ||
              availabilityColorMap.immediate
            }`}
          >
            <Clock className="h-3 w-3" />
            {availabilityLabel}
          </span>
          {candidate.location && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <MapPin className="h-3 w-3 text-slate-400" />
              {candidate.location}
            </span>
          )}
        </div>

        {/* Latest experience teaser */}
        {latestExp && (
          <div className="mt-3.5 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <Briefcase className="h-3.5 w-3.5 shrink-0 text-cyan-600 dark:text-cyan-400" />
            <span className="line-clamp-1">
              <span className="font-semibold text-slate-900 dark:text-white">
                {latestExp.title}
              </span>{" "}
              at {latestExp.company}
            </span>
          </div>
        )}

        {/* Skills Chips */}
        {candidate.skills && candidate.skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {candidate.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="rounded-lg border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300"
              >
                {skill}
              </span>
            ))}
            {candidate.skills.length > 4 && (
              <span className="rounded-lg bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                +{candidate.skills.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Recruiter Note Snippet if saved */}
        {isSaved && savedNote && (
          <div className="mt-4 rounded-xl border border-amber-200/60 bg-amber-50/50 p-2.5 text-[11px] text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
            <span className="font-semibold">Note:</span>{" "}
            <span className="line-clamp-2">{savedNote}</span>
          </div>
        )}
      </div>

      {/* Footer action buttons */}
      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          {candidate.resumeUrl && (
            <a
              href={candidate.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400"
            >
              <FileText className="h-3.5 w-3.5" />
              Resume
            </a>
          )}
        </div>

        <button
          type="button"
          onClick={() => onViewProfile(candidate)}
          className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-800 transition hover:bg-cyan-50 hover:text-cyan-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white"
        >
          View Profile
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
