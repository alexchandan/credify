"use client";

import { useState } from "react";
import { Bookmark, X, Loader2, Sparkles } from "lucide-react";

interface SaveCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  initialNote?: string;
  isSaved?: boolean;
  onSave: (note: string) => Promise<void>;
  onUnsave?: () => Promise<void>;
}

const NOTE_SUGGESTIONS = [
  "Strong match for active opening",
  "Reach out next quarter",
  "Impressive portfolio & tech stack",
  "Follow up regarding compensation",
  "Recommended for senior technical interview",
];

export function SaveCandidateModal({
  isOpen,
  onClose,
  candidateName,
  initialNote = "",
  isSaved = false,
  onSave,
  onUnsave,
}: SaveCandidateModalProps) {
  const [note, setNote] = useState(initialNote);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevInitialNote, setPrevInitialNote] = useState(initialNote);

  if (isOpen !== prevIsOpen || initialNote !== prevInitialNote) {
    setPrevIsOpen(isOpen);
    setPrevInitialNote(initialNote);
    setNote(initialNote);
    setError(null);
  }

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await onSave(note.trim());
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to save candidate note",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUnsave() {
    if (!onUnsave) return;
    setIsRemoving(true);
    setError(null);
    try {
      await onUnsave();
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to remove saved candidate",
      );
    } finally {
      setIsRemoving(false);
    }
  }

  function appendSuggestion(suggestion: string) {
    setNote((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return suggestion;
      if (trimmed.includes(suggestion)) return prev;
      return `${trimmed}. ${suggestion}`;
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-candidate-title"
      className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-xs duration-200"
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xl transition sm:p-7 dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400">
              <Bookmark className="h-5 w-5 fill-current" />
            </span>
            <div>
              <h2
                id="save-candidate-title"
                className="text-lg font-bold text-slate-950 dark:text-white"
              >
                {isSaved ? "Edit Talent Note" : "Save to Talent Pool"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Candidate:{" "}
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {candidateName}
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50/80 p-3 text-xs text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="candidate-note"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Private Recruiter Note (Optional)
              </label>
              <span className="text-[11px] text-slate-400">
                {note.length} / 1000
              </span>
            </div>
            <textarea
              id="candidate-note"
              rows={4}
              maxLength={1000}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Discussed potential Lead React role; very strong system design background. Aiming for $140k+."
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-3 focus:ring-cyan-500/15 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950/50 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-400 dark:focus:bg-slate-950"
            />
          </div>

          <div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <Sparkles className="h-3 w-3 text-cyan-500" />
              <span>Quick tags & suggestions:</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {NOTE_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => appendSuggestion(suggestion)}
                  className="rounded-lg border border-slate-200/80 bg-slate-100/70 px-2.5 py-1 text-[11px] font-medium text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-800 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:border-cyan-800 dark:hover:bg-cyan-950/40 dark:hover:text-cyan-300"
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse justify-between gap-2.5 border-t border-slate-100 pt-5 sm:flex-row sm:items-center dark:border-slate-800">
            {isSaved && onUnsave ? (
              <button
                type="button"
                onClick={handleUnsave}
                disabled={isRemoving || isSubmitting}
                className="inline-flex items-center justify-center rounded-xl border border-red-200/80 px-4 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                {isRemoving ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Removing...
                  </>
                ) : (
                  "Remove from Saved"
                )}
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting || isRemoving}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isRemoving}
                className="inline-flex items-center justify-center rounded-xl bg-linear-to-r from-cyan-600 to-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm shadow-cyan-500/20 transition hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 dark:from-cyan-500 dark:to-blue-500"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : isSaved ? (
                  "Update Note"
                ) : (
                  "Save Candidate"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
