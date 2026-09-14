"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Bookmark,
  Users,
  Search,
  ExternalLink,
  Trash2,
  Edit3,
  MapPin,
  Clock,
  Briefcase,
  FileText,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { apiRequest } from "@/lib/apiClient";
import { getErrorMessage } from "@/lib/formErrors";
import { CandidateProfileDrawer } from "@/components/recruiter/CandidateProfileDrawer";
import { SaveCandidateModal } from "@/components/recruiter/SaveCandidateModal";
import CandidateBoardSkeleton from "@/components/ui/skeletons/CandidateBoardSkeleton";
import type { CandidateProfile } from "@/types/candidate";
import { AVAILABILITY_OPTIONS } from "@/types/candidate";
import type { SavedCandidate } from "@/types/savedCandidate";

export default function RecruiterSavedCandidatesPage() {
  const [, startTransition] = useTransition();

  const [savedCandidates, setSavedCandidates] = useState<SavedCandidate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Drawer / Modal state
  const [activeProfile, setActiveProfile] = useState<CandidateProfile | null>(
    null,
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] =
    useState<SavedCandidate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiRequest<SavedCandidate[]>(
          "/savedCandidate/me?limit=50",
          {
            signal: controller.signal,
          },
        );
        if (controller.signal.aborted) return;
        const list = Array.isArray(res.data) ? res.data : [];
        setSavedCandidates(list);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(getErrorMessage(err));
        setSavedCandidates([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, []);

  // Handle note edit
  async function handleSaveNote(note: string) {
    if (!editingCandidate) return;
    const res = await apiRequest<SavedCandidate>(
      `/savedCandidate/${editingCandidate._id}`,
      {
        method: "PATCH",
        body: { note },
      },
    );

    startTransition(() => {
      setSavedCandidates((prev) =>
        prev.map((item) =>
          item._id === editingCandidate._id
            ? { ...item, note: res.data.note }
            : item,
        ),
      );
    });
  }

  // Handle unsave
  async function handleUnsave() {
    if (!editingCandidate) return;
    await apiRequest(`/savedCandidate/${editingCandidate._id}`, {
      method: "DELETE",
    });

    startTransition(() => {
      setSavedCandidates((prev) =>
        prev.filter((item) => item._id !== editingCandidate._id),
      );
    });
  }

  // Quick unsave directly from card
  async function handleQuickUnsave(item: SavedCandidate) {
    try {
      await apiRequest(`/savedCandidate/${item._id}`, {
        method: "DELETE",
      });
      startTransition(() => {
        setSavedCandidates((prev) => prev.filter((s) => s._id !== item._id));
      });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  // Filter saved candidates by search term
  const list = Array.isArray(savedCandidates) ? savedCandidates : [];
  const filteredList = list.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const cand = item?.candidate;
    const nameMatch = cand?.fullName?.toLowerCase().includes(term);
    const headlineMatch = cand?.headline?.toLowerCase().includes(term);
    const skillMatch = cand?.skills?.some((s) =>
      s.toLowerCase().includes(term),
    );
    const noteMatch = item?.note?.toLowerCase().includes(term);
    return Boolean(nameMatch || headlineMatch || skillMatch || noteMatch);
  });

  return (
    <div className="flex flex-1 flex-col bg-slate-50/70 dark:bg-slate-950">
      {/* Header section */}
      <section className="border-b border-slate-200/80 bg-white px-4 py-10 sm:px-6 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                  <Bookmark className="h-4 w-4 fill-current" />
                </span>
                <span className="text-xs font-bold tracking-wider text-amber-600 uppercase dark:text-amber-400">
                  Talent Pipeline
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl dark:text-white">
                Saved Candidates Pool
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Organize prospective talent with private notes and quickly
                access full profiles for upcoming hiring needs.
              </p>
            </div>

            <Link
              href="/recruiter/candidates"
              className="inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-cyan-600 to-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:from-cyan-500 hover:to-blue-500"
            >
              <Users className="h-4 w-4" />
              Source More Talent
            </Link>
          </div>

          {/* Search within saved talent */}
          {savedCandidates.length > 0 && (
            <div className="mt-8 max-w-md">
              <div className="relative">
                <Search className="pointer-events-none absolute top-3.5 left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter saved by name, skill, or note..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2.5 pr-3.5 pl-10 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-3 focus:ring-cyan-500/15 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-400"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-950 dark:text-white">
              {loading
                ? "Loading saved talent..."
                : `${filteredList.length} Saved Candidate${filteredList.length === 1 ? "" : "s"}`}
            </h2>
            {searchTerm && (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Filtered from {savedCandidates.length}
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <CandidateBoardSkeleton />
        ) : savedCandidates.length === 0 ? (
          /* Zero Saved Candidates State */
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 dark:bg-amber-950/60 dark:text-amber-400">
              <Bookmark className="h-8 w-8 fill-current" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">
              No saved candidates yet
            </h3>
            <p className="mt-1.5 max-w-md text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Bookmark top candidates while searching talent to build your
              company’s prospective pipeline and keep private evaluation notes.
            </p>
            <Link
              href="/recruiter/candidates"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-cyan-600 to-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:from-cyan-500 hover:to-blue-500"
            >
              <Sparkles className="h-4 w-4" />
              Discover Talent
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : filteredList.length === 0 ? (
          /* Filter No-Match State */
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              No saved candidates matched &quot;{searchTerm}&quot;
            </p>
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="mt-3 text-xs font-semibold text-cyan-600 hover:underline dark:text-cyan-400"
            >
              Clear filter
            </button>
          </div>
        ) : (
          /* Saved Candidate List */
          <div className="space-y-3.5">
            {filteredList.map((item) => {
              const cand = item.candidate;
              const initials = cand?.fullName
                ? cand.fullName
                    .split(/\s+/)
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()
                : "CD";

              const availabilityLabel = cand
                ? (AVAILABILITY_OPTIONS.find(
                    (opt) => opt.value === cand.availability,
                  )?.label ?? "Available")
                : "Available";

              return (
                <div
                  key={item._id}
                  className="group relative flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-xs transition hover:border-slate-300 hover:shadow-md sm:p-5 lg:flex-row lg:items-center dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                >
                  {/* Left / Info section */}
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    {cand?.avatarUrl ? (
                      <div className="relative h-13 w-13 shrink-0 overflow-hidden rounded-2xl border border-slate-100 shadow-xs dark:border-slate-800">
                        <Image
                          src={cand.avatarUrl}
                          alt={cand.fullName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-linear-to-tr from-cyan-600 to-blue-600 text-base font-bold text-white shadow-xs">
                        {initials}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <h3
                          onClick={() => {
                            if (cand) {
                              setActiveProfile(cand);
                              setIsDrawerOpen(true);
                            }
                          }}
                          className="cursor-pointer text-base font-bold text-slate-950 transition hover:text-cyan-600 dark:text-white dark:hover:text-cyan-400"
                        >
                          {cand?.fullName ?? "Unknown Candidate"}
                        </h3>
                        {cand && (
                          <>
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-300">
                              <Clock className="h-3 w-3" />
                              {availabilityLabel}
                            </span>
                            {cand.location && (
                              <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                {cand.location}
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      <p className="mt-0.5 line-clamp-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                        {cand?.headline ?? "Software Professional"}
                      </p>

                      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                        {cand?.experience?.[0] && (
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="h-3.5 w-3.5 shrink-0 text-cyan-600 dark:text-cyan-400" />
                            <span className="line-clamp-1">
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {cand.experience[0].title}
                              </span>{" "}
                              at {cand.experience[0].company}
                            </span>
                          </div>
                        )}

                        {cand?.skills && cand.skills.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {cand.experience?.[0] && (
                              <span className="hidden text-slate-300 sm:inline dark:text-slate-700">
                                •
                              </span>
                            )}
                            {cand.skills.slice(0, 4).map((skill) => (
                              <span
                                key={skill}
                                className="rounded-lg border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300"
                              >
                                {skill}
                              </span>
                            ))}
                            {cand.skills.length > 4 && (
                              <span className="rounded-lg bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                +{cand.skills.length - 4}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Recruiter Note Badge */}
                      <div className="mt-2.5 inline-flex flex-wrap items-center gap-2 rounded-xl border border-amber-200/80 bg-amber-50/60 px-3 py-1.5 dark:border-amber-900/50 dark:bg-amber-950/30">
                        <span className="text-[10px] font-bold tracking-wider text-amber-900 uppercase dark:text-amber-300">
                          Note:
                        </span>
                        <span className="text-xs text-amber-950 dark:text-amber-200">
                          {item.note ? (
                            item.note
                          ) : (
                            <span className="text-amber-700/70 italic dark:text-amber-400/60">
                              No notes added.
                            </span>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCandidate(item);
                            setIsModalOpen(true);
                          }}
                          className="ml-1 inline-flex items-center gap-0.5 text-[11px] font-semibold text-amber-800 hover:underline dark:text-amber-400"
                        >
                          <Edit3 className="h-2.5 w-2.5" /> Edit
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex shrink-0 items-center justify-between gap-2.5 border-t border-slate-100 pt-3 sm:justify-end lg:border-t-0 lg:pt-0 dark:border-slate-800/80">
                    {cand?.resumeUrl && (
                      <a
                        href={cand.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-cyan-300 hover:bg-cyan-50/50 hover:text-cyan-700 dark:border-slate-800 dark:text-slate-400 dark:hover:border-cyan-800 dark:hover:bg-cyan-950/40 dark:hover:text-cyan-300"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Resume
                        <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => handleQuickUnsave(item)}
                      title="Remove from saved talent"
                      className="rounded-xl border border-transparent p-2 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:border-red-900/50 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (cand) {
                          setActiveProfile(cand);
                          setIsDrawerOpen(true);
                        }
                      }}
                      className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                    >
                      View Profile
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Candidate Profile Drawer */}
      <CandidateProfileDrawer
        candidate={activeProfile}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        isSaved={true}
        savedNote={
          activeProfile
            ? savedCandidates.find((s) => s.candidateId === activeProfile._id)
                ?.note
            : undefined
        }
        onOpenSaveModal={() => {
          if (activeProfile) {
            const savedItem = savedCandidates.find(
              (s) => s.candidateId === activeProfile._id,
            );
            if (savedItem) {
              setEditingCandidate(savedItem);
              setIsModalOpen(true);
            }
          }
        }}
      />

      {/* Edit Note Modal */}
      {editingCandidate && (
        <SaveCandidateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          candidateName={editingCandidate.candidate?.fullName ?? "Candidate"}
          initialNote={editingCandidate.note ?? ""}
          isSaved={true}
          onSave={handleSaveNote}
          onUnsave={handleUnsave}
        />
      )}
    </div>
  );
}
