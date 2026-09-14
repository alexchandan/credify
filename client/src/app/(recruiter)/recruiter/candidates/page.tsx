"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Search,
  MapPin,
  Clock,
  Filter,
  Users,
  Bookmark,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  LayoutGrid,
  List,
} from "lucide-react";
import Link from "next/link";
import { apiRequest } from "@/lib/apiClient";
import { getErrorMessage } from "@/lib/formErrors";
import { CandidateCard } from "@/components/recruiter/CandidateCard";
import { CandidateProfileDrawer } from "@/components/recruiter/CandidateProfileDrawer";
import { SaveCandidateModal } from "@/components/recruiter/SaveCandidateModal";
import CandidateBoardSkeleton from "@/components/ui/skeletons/CandidateBoardSkeleton";
import type { CandidateProfile, Availability } from "@/types/candidate";
import type { SavedCandidate } from "@/types/savedCandidate";

const POPULAR_SKILLS = [
  "React",
  "TypeScript",
  "Node.js",
  "Next.js",
  "Python",
  "AWS",
  "Tailwind CSS",
  "PostgreSQL",
  "Docker",
];

const AVAILABILITY_FILTER_OPTIONS: {
  value: Availability | "all";
  label: string;
}[] = [
  { value: "all", label: "All Availability" },
  { value: "immediate", label: "Immediate" },
  { value: "within_two_weeks", label: "2 Weeks Notice" },
  { value: "within_one_month", label: "1 Month Notice" },
];

export default function RecruiterCandidatesPage() {
  const [, startTransition] = useTransition();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedAvailability, setSelectedAvailability] = useState<
    Availability | "all"
  >("all");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Data State
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [savedMap, setSavedMap] = useState<
    Map<string, { savedId: string; note: string }>
  >(new Map());

  // UI / Loading State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal / Drawer State
  const [activeProfile, setActiveProfile] = useState<CandidateProfile | null>(
    null,
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [modalCandidate, setModalCandidate] = useState<CandidateProfile | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initial load for saved candidates
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const res = await apiRequest<SavedCandidate[]>(
          "/savedCandidate/me?limit=50",
          {
            signal: controller.signal,
          },
        );
        if (controller.signal.aborted) return;
        const list = Array.isArray(res.data) ? res.data : [];
        const map = new Map<string, { savedId: string; note: string }>();
        for (const item of list) {
          map.set(item.candidateId, {
            savedId: item._id,
            note: item.note ?? "",
          });
        }
        setSavedMap(map);
      } catch {
        // Ignore background saved candidate failure
      }
    }
    void load();
    return () => controller.abort();
  }, []);

  // Search candidates with debounced query
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      async function runSearch() {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams();
        if (searchTerm.trim()) queryParams.set("q", searchTerm.trim());
        if (selectedSkill.trim())
          queryParams.set("skill", selectedSkill.trim());
        if (selectedLocation.trim())
          queryParams.set("location", selectedLocation.trim());
        if (selectedAvailability !== "all")
          queryParams.set("availability", selectedAvailability);
        queryParams.set("page", String(page));
        queryParams.set("limit", "9");

        try {
          const res = await apiRequest<CandidateProfile[]>(
            `/search/candidates?${queryParams.toString()}`,
            { signal: controller.signal },
          );
          if (controller.signal.aborted) return;
          setCandidates(res.data);
          const meta = res.meta ?? {};
          setTotalCount(Number(meta.totalCount ?? res.data.length));
          setTotalPages(Number(meta.totalPages ?? 1));
        } catch (err) {
          if (controller.signal.aborted) return;
          setError(getErrorMessage(err));
          setCandidates([]);
        } finally {
          if (!controller.signal.aborted) setLoading(false);
        }
      }
      void runSearch();
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchTerm, selectedSkill, selectedLocation, selectedAvailability, page]);

  // Reset filters
  function handleResetFilters() {
    setSearchTerm("");
    setSelectedSkill("");
    setSelectedLocation("");
    setSelectedAvailability("all");
    setPage(1);
  }

  // Open drawer
  function handleViewProfile(cand: CandidateProfile) {
    setActiveProfile(cand);
    setIsDrawerOpen(true);
  }

  // Open save modal
  function handleToggleSave(cand: CandidateProfile) {
    setModalCandidate(cand);
    setIsModalOpen(true);
  }

  // Save or update note
  async function handleSaveNote(note: string) {
    if (!modalCandidate) return;
    const existing = savedMap.get(modalCandidate._id);

    if (existing) {
      // Update existing note
      const res = await apiRequest<SavedCandidate>(
        `/savedCandidate/${existing.savedId}`,
        {
          method: "PATCH",
          body: { note },
        },
      );
      startTransition(() => {
        setSavedMap((prev) => {
          const updated = new Map(prev);
          updated.set(modalCandidate._id, {
            savedId: res.data._id,
            note: res.data.note ?? "",
          });
          return updated;
        });
      });
    } else {
      // Create new saved candidate
      const res = await apiRequest<SavedCandidate>("/savedCandidate", {
        method: "POST",
        body: {
          candidateId: modalCandidate._id,
          note: note || undefined,
        },
      });
      startTransition(() => {
        setSavedMap((prev) => {
          const updated = new Map(prev);
          updated.set(modalCandidate._id, {
            savedId: res.data._id,
            note: res.data.note ?? "",
          });
          return updated;
        });
      });
    }
  }

  // Remove candidate from saved
  async function handleUnsave() {
    if (!modalCandidate) return;
    const existing = savedMap.get(modalCandidate._id);
    if (!existing) return;

    await apiRequest(`/savedCandidate/${existing.savedId}`, {
      method: "DELETE",
    });

    startTransition(() => {
      setSavedMap((prev) => {
        const updated = new Map(prev);
        updated.delete(modalCandidate._id);
        return updated;
      });
    });
  }

  const activeSavedInfo = activeProfile
    ? savedMap.get(activeProfile._id)
    : undefined;
  const isFilterActive = Boolean(
    searchTerm.trim() ||
    selectedSkill ||
    selectedLocation ||
    selectedAvailability !== "all",
  );

  return (
    <div className="flex flex-1 flex-col bg-slate-50/70 dark:bg-slate-950">
      {/* Header Banner */}
      <section className="border-b border-slate-200/80 bg-white px-4 py-10 sm:px-6 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400">
                  <Users className="h-4 w-4" />
                </span>
                <span className="text-xs font-bold tracking-wider text-cyan-600 uppercase dark:text-cyan-400">
                  Talent Sourcing
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl dark:text-white">
                Discover Top Talent
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Source pre-vetted candidates, filter by real-world tech stacks,
                and save prospects to your hiring pipeline.
              </p>
            </div>

            <Link
              href="/recruiter/saved-candidates"
              className="inline-flex items-center gap-2 rounded-2xl border border-amber-200/80 bg-amber-50/70 px-4 py-2.5 text-xs font-semibold text-amber-900 shadow-xs transition hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-950/60"
            >
              <Bookmark className="h-4 w-4 fill-current text-amber-500" />
              View Saved Talent ({savedMap.size})
            </Link>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-8 rounded-3xl border border-slate-200/80 bg-slate-50/70 p-4 shadow-xs sm:p-5 dark:border-slate-800 dark:bg-slate-950/70">
            <div className="grid gap-3 md:grid-cols-12">
              {/* Keyword / Name Search */}
              <div className="relative md:col-span-5">
                <Search className="pointer-events-none absolute top-3.5 left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by title, name, or keywords..."
                  className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pr-3.5 pl-10 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-3 focus:ring-cyan-500/15 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-400"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setPage(1);
                    }}
                    className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Location Input */}
              <div className="relative md:col-span-4">
                <MapPin className="pointer-events-none absolute top-3.5 left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={selectedLocation}
                  onChange={(e) => {
                    setSelectedLocation(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Location (e.g. Remote, Berlin, SF)"
                  className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pr-3.5 pl-10 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-3 focus:ring-cyan-500/15 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-400"
                />
              </div>

              {/* Availability Dropdown */}
              <div className="relative md:col-span-3">
                <Clock className="pointer-events-none absolute top-3.5 left-3.5 h-4 w-4 text-slate-400" />
                <select
                  value={selectedAvailability}
                  onChange={(e) => {
                    setSelectedAvailability(
                      e.target.value as Availability | "all",
                    );
                    setPage(1);
                  }}
                  className="w-full appearance-none rounded-2xl border border-slate-200 bg-white py-2.5 pr-8 pl-10 text-sm text-slate-900 transition focus:border-cyan-500 focus:ring-3 focus:ring-cyan-500/15 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-cyan-400"
                >
                  {AVAILABILITY_FILTER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Skills Filter Bar */}
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200/60 pt-2 dark:border-slate-800/80">
              <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 uppercase">
                <Sparkles className="h-3 w-3 text-cyan-500" /> Top Skills:
              </span>
              {POPULAR_SKILLS.map((skill) => {
                const isSelected =
                  selectedSkill.toLowerCase() === skill.toLowerCase();
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => {
                      setSelectedSkill(isSelected ? "" : skill);
                      setPage(1);
                    }}
                    className={`rounded-xl px-2.5 py-1 text-xs font-medium transition ${
                      isSelected
                        ? "bg-cyan-600 text-white shadow-xs dark:bg-cyan-500"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-cyan-800 dark:hover:text-cyan-300"
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}

              {isFilterActive && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                >
                  <RotateCcw className="h-3 w-3" /> Clear filters
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Results Section */}
      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        {/* Results count & status header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-950 dark:text-white">
              {loading
                ? "Searching candidates..."
                : `${totalCount} Candidate${totalCount === 1 ? "" : "s"} Found`}
            </h2>
            {isFilterActive && !loading && (
              <span className="rounded-full bg-cyan-50 px-2.5 py-0.5 text-xs font-medium text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300">
                Filtered
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-400">
              Page {page} of {totalPages || 1}
            </div>

            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                title="List view"
                aria-label="List view"
                className={`rounded-lg p-1.5 transition ${
                  viewMode === "list"
                    ? "bg-cyan-50 text-cyan-700 shadow-xs dark:bg-cyan-950/60 dark:text-cyan-400"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="Grid view"
                aria-label="Grid view"
                className={`rounded-lg p-1.5 transition ${
                  viewMode === "grid"
                    ? "bg-cyan-50 text-cyan-700 shadow-xs dark:bg-cyan-950/60 dark:text-cyan-400"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <CandidateBoardSkeleton variant={viewMode} />
        ) : candidates.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
              <Filter className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">
              No candidates match your filters
            </h3>
            <p className="mt-1 max-w-md text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Try adjusting your search keywords, clearing skill tags, or
              broadening your location preference to discover more talent.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset all filters
            </button>
          </div>
        ) : viewMode === "list" ? (
          /* Candidate List */
          <div className="space-y-3.5">
            {candidates.map((cand) => {
              const savedItem = savedMap.get(cand._id);
              return (
                <CandidateCard
                  key={cand._id}
                  candidate={cand}
                  variant="list"
                  isSaved={Boolean(savedItem)}
                  savedNote={savedItem?.note}
                  onViewProfile={handleViewProfile}
                  onToggleSave={handleToggleSave}
                />
              );
            })}
          </div>
        ) : (
          /* Candidate Cards Grid */
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {candidates.map((cand) => {
              const savedItem = savedMap.get(cand._id);
              return (
                <CandidateCard
                  key={cand._id}
                  candidate={cand}
                  variant="card"
                  isSaved={Boolean(savedItem)}
                  savedNote={savedItem?.note}
                  onViewProfile={handleViewProfile}
                  onToggleSave={handleToggleSave}
                />
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>

            <span className="px-3 text-xs font-medium text-slate-500 dark:text-slate-400">
              {page} / {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => {
                setPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </section>

      {/* Candidate Profile Slide-over Drawer */}
      <CandidateProfileDrawer
        candidate={activeProfile}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        isSaved={Boolean(activeSavedInfo)}
        savedNote={activeSavedInfo?.note}
        onOpenSaveModal={() => {
          if (activeProfile) {
            setModalCandidate(activeProfile);
            setIsModalOpen(true);
          }
        }}
      />

      {/* Save Candidate / Note Modal */}
      {modalCandidate && (
        <SaveCandidateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          candidateName={modalCandidate.fullName}
          initialNote={savedMap.get(modalCandidate._id)?.note ?? ""}
          isSaved={savedMap.has(modalCandidate._id)}
          onSave={handleSaveNote}
          onUnsave={handleUnsave}
        />
      )}
    </div>
  );
}
