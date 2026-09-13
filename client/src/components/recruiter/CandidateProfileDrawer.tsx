"use client";

import { useEffect } from "react";
import {
  X,
  MapPin,
  Clock,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Award,
  Globe,
  Link2,
  FileText,
  Bookmark,
  Edit3,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import type { CandidateProfile } from "@/types/candidate";
import { AVAILABILITY_OPTIONS } from "@/types/candidate";

interface CandidateProfileDrawerProps {
  candidate: CandidateProfile | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved?: boolean;
  savedNote?: string;
  onOpenSaveModal?: () => void;
}

export function CandidateProfileDrawer({
  candidate,
  isOpen,
  onClose,
  isSaved = false,
  savedNote = "",
  onOpenSaveModal,
}: CandidateProfileDrawerProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !candidate) return null;

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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="candidate-drawer-title"
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
        <aside
          className="relative w-screen max-w-2xl transform overflow-y-auto bg-white shadow-2xl transition duration-300 ease-in-out dark:bg-slate-900"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Header sticky bar */}
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-6 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
            <span className="text-xs font-bold tracking-wider text-cyan-600 uppercase dark:text-cyan-400">
              Candidate Profile
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Close profile drawer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-8 p-6 sm:p-8">
            {/* Identity & Actions Card */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-linear-to-b from-slate-50 to-white p-6 dark:border-slate-800 dark:from-slate-950 dark:to-slate-900">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  {candidate.avatarUrl ? (
                    <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-2xl border-2 border-white shadow-md dark:border-slate-800">
                      <Image
                        src={candidate.avatarUrl}
                        alt={candidate.fullName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-18 w-18 shrink-0 items-center justify-center rounded-2xl bg-linear-to-tr from-cyan-600 to-blue-600 text-xl font-bold text-white shadow-md">
                      {initials}
                    </div>
                  )}
                  <div>
                    <h2
                      id="candidate-drawer-title"
                      className="text-xl font-bold text-slate-950 sm:text-2xl dark:text-white"
                    >
                      {candidate.fullName}
                    </h2>
                    {candidate.headline && (
                      <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                        {candidate.headline}
                      </p>
                    )}
                    <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      {candidate.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {candidate.location}
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-medium ${
                          availabilityColorMap[candidate.availability] ||
                          availabilityColorMap.immediate
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        {availabilityLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                  {onOpenSaveModal && (
                    <button
                      type="button"
                      onClick={onOpenSaveModal}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-xs transition ${
                        isSaved
                          ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      <Bookmark
                        className={`h-3.5 w-3.5 ${isSaved ? "fill-current text-amber-500" : ""}`}
                      />
                      {isSaved ? "Saved in Pool" : "Save Candidate"}
                    </button>
                  )}

                  {candidate.resumeUrl && (
                    <a
                      href={candidate.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-linear-to-r from-cyan-600 to-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:from-cyan-500 hover:to-blue-500"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      View Resume
                      <ExternalLink className="h-3 w-3 opacity-70" />
                    </a>
                  )}
                </div>
              </div>

              {/* Social links row */}
              {candidate.socialLinks && (
                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-800/80">
                  {candidate.socialLinks.portfolio && (
                    <a
                      href={candidate.socialLinks.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400"
                    >
                      <Globe className="h-3.5 w-3.5" /> Portfolio
                    </a>
                  )}
                  {candidate.socialLinks.github && (
                    <a
                      href={candidate.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                    >
                      <Link2 className="h-3.5 w-3.5" /> GitHub
                    </a>
                  )}
                  {candidate.socialLinks.linkedIn && (
                    <a
                      href={candidate.socialLinks.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                    >
                      <Link2 className="h-3.5 w-3.5" /> LinkedIn
                    </a>
                  )}
                  {candidate.socialLinks.twitter && (
                    <a
                      href={candidate.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-sky-500 dark:text-slate-400 dark:hover:text-sky-400"
                    >
                      <Link2 className="h-3.5 w-3.5" /> Twitter
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Recruiter Private Note Box */}
            {isSaved && (
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-5 dark:border-amber-900/50 dark:bg-amber-950/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bookmark className="h-4 w-4 fill-current text-amber-600 dark:text-amber-400" />
                    <h3 className="text-xs font-bold tracking-wider text-amber-900 uppercase dark:text-amber-300">
                      Private Recruiter Note
                    </h3>
                  </div>
                  {onOpenSaveModal && (
                    <button
                      type="button"
                      onClick={onOpenSaveModal}
                      className="inline-flex items-center gap-1 text-xs font-medium text-amber-800 hover:underline dark:text-amber-400"
                    >
                      <Edit3 className="h-3.5 w-3.5" /> Edit note
                    </button>
                  )}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-amber-950 dark:text-amber-200">
                  {savedNote
                    ? savedNote
                    : "No notes written yet. Click 'Edit note' to add private context."}
                </p>
              </div>
            )}

            {/* Skills section */}
            {candidate.skills && candidate.skills.length > 0 && (
              <section>
                <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                  Technical Expertise & Skills
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-xl border border-slate-200 bg-slate-100/70 px-3 py-1 text-xs font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Experience timeline */}
            {candidate.experience && candidate.experience.length > 0 && (
              <section>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                    Work Experience
                  </h3>
                </div>
                <div className="mt-4 space-y-4 border-l-2 border-slate-200 pl-4 dark:border-slate-800">
                  {candidate.experience.map((exp, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute top-1.5 -left-[21px] h-2.5 w-2.5 rounded-full border-2 border-white bg-cyan-600 dark:border-slate-900 dark:bg-cyan-400" />
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                          {exp.title}
                        </h4>
                        <span className="text-xs text-slate-400">
                          {exp.startDate} -{" "}
                          {exp.isCurrent ? "Present" : (exp.endDate ?? "N/A")}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-cyan-700 dark:text-cyan-300">
                        {exp.company}
                      </p>
                      {exp.description && (
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Projects */}
            {candidate.projects && candidate.projects.length > 0 && (
              <section>
                <div className="flex items-center gap-2">
                  <FolderGit2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                    Featured Projects
                  </h3>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {candidate.projects.map((proj, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                          {proj.title}
                        </h4>
                        {proj.link && (
                          <a
                            href={proj.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-blue-500"
                            aria-label={`Open link for ${proj.title}`}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                      {proj.description && (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {proj.description}
                        </p>
                      )}
                      {proj.techStack && proj.techStack.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1">
                          {proj.techStack.map((tech) => (
                            <span
                              key={tech}
                              className="rounded-md bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 shadow-xs dark:bg-slate-900 dark:text-slate-300"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {candidate.education && candidate.education.length > 0 && (
              <section>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                    Education
                  </h3>
                </div>
                <div className="mt-3 space-y-3">
                  {candidate.education.map((edu, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                          {edu.degree}{" "}
                          {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
                        </h4>
                        <span className="text-xs text-slate-400">
                          {edu.startDate} - {edu.endDate ?? "Present"}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                        {edu.institution}{" "}
                        {edu.grade ? `· Grade: ${edu.grade}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications */}
            {candidate.certifications &&
              candidate.certifications.length > 0 && (
                <section>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                      Certifications
                    </h3>
                  </div>
                  <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                    {candidate.certifications.map((cert, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40"
                      >
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {cert.name}
                        </p>
                        <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                          {cert.issuingOrg} · Issued {cert.issueDate}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
          </div>
        </aside>
      </div>
    </div>
  );
}
