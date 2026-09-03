"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Globe,
  LoaderCircle,
  MapPin,
  Plus,
  Sparkles,
  X,
  AlertCircle,
} from "lucide-react";
import { apiRequest } from "@/lib/apiClient";
import { getErrorMessage, parseFieldErrors } from "@/lib/formErrors";
import type { Job } from "@/types/job";

const POPULAR_SKILLS = [
  "TypeScript",
  "React",
  "Node.js",
  "Python",
  "Go",
  "PostgreSQL",
  "MongoDB",
  "AWS",
  "Docker",
  "GraphQL",
  "Tailwind CSS",
  "Next.js",
];

const CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "INR", symbol: "₹" },
  { code: "CAD", symbol: "CA$" },
];

export default function PostJobPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [employmentType, setEmploymentType] = useState<
    "full_time" | "part_time" | "contract" | "internship"
  >("full_time");
  const [experienceLevel, setExperienceLevel] = useState<
    "entry" | "mid" | "senior" | "lead"
  >("mid");
  const [isRemote, setIsRemote] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [salaryMin, setSalaryMin] = useState<string>("");
  const [salaryMax, setSalaryMax] = useState<string>("");
  const [currency, setCurrency] = useState("USD");
  const [description, setDescription] = useState("");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionType, setActionType] = useState<"draft" | "publish" | null>(
    null,
  );

  function addSkill(skillToAdd: string) {
    const trimmed = skillToAdd.trim();
    if (!trimmed || skills.includes(trimmed)) return;
    setSkills((prev) => [...prev, trimmed]);
    setSkillInput("");
    if (fieldErrors.skillsRequired) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.skillsRequired;
        return next;
      });
    }
  }

  function removeSkill(skillToRemove: string) {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  }

  function addLocation(locToAdd: string) {
    const trimmed = locToAdd.trim();
    if (!trimmed || locations.includes(trimmed)) return;
    setLocations((prev) => [...prev, trimmed]);
    setLocationInput("");
  }

  function removeLocation(locToRemove: string) {
    setLocations((prev) => prev.filter((l) => l !== locToRemove));
  }

  async function handleSubmit(targetPublish: boolean) {
    setFieldErrors({});
    setGeneralError(null);

    // Basic client validation
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = "Job title is required";
    if (!description.trim()) errors.description = "Job description is required";
    if (description.trim().length > 1000)
      errors.description = "Description cannot exceed 1000 characters";
    if (!isRemote && locations.length === 0)
      errors.location = "Please provide at least one location or enable remote";

    const parsedMin = salaryMin ? Number(salaryMin) : undefined;
    const parsedMax = salaryMax ? Number(salaryMax) : undefined;
    if (
      parsedMin !== undefined &&
      parsedMax !== undefined &&
      parsedMin > parsedMax
    ) {
      errors.salaryRange = "Minimum salary cannot exceed maximum salary";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setActionType(targetPublish ? "publish" : "draft");

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        employmentType,
        experienceLevel,
        isRemote,
        location: locations,
        skillsRequired: skills,
        salaryRange:
          parsedMin !== undefined || parsedMax !== undefined
            ? {
                min: parsedMin,
                max: parsedMax,
                currency,
              }
            : undefined,
      };

      const jobRes = await apiRequest<Job>("/jobs", {
        method: "POST",
        body: payload,
      });

      if (targetPublish && jobRes.data._id) {
        await apiRequest(`/jobs/${jobRes.data._id}/publish`, {
          method: "PATCH",
        });
      }

      router.push("/recruiter/jobs");
    } catch (err) {
      const parsed = parseFieldErrors(err);
      if (Object.keys(parsed).length > 0) {
        setFieldErrors(parsed);
      } else {
        setGeneralError(getErrorMessage(err));
      }
    } finally {
      setIsSubmitting(false);
      setActionType(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button and breadcrumb */}
      <div className="mb-6">
        <Link
          href="/recruiter/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 transition hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all jobs
        </Link>
      </div>

      {/* Page Header */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-300">
          <Sparkles className="h-3.5 w-3.5" />
          Job Creation Workspace
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          Post a New Opportunity
        </h1>
        <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
          Reach qualified, credential-verified talent. Complete the details
          below to publish or save as draft.
        </p>

        {generalError && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{generalError}</p>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(true);
          }}
          className="mt-8 space-y-8"
        >
          {/* 1. Basic Info */}
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              1. Basic Position Info
            </h2>

            <div>
              <label
                htmlFor="job-title"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Job Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="job-title"
                type="text"
                required
                maxLength={150}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className={`mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 transition outline-none dark:bg-slate-950 dark:text-white ${
                  fieldErrors.title
                    ? "border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    : "border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700"
                }`}
              />
              {fieldErrors.title && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                  {fieldErrors.title}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="employment-type"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Employment Type
                </label>
                <select
                  id="employment-type"
                  value={employmentType}
                  onChange={(e) =>
                    setEmploymentType(e.target.value as typeof employmentType)
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="experience-level"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Experience Level
                </label>
                <select
                  id="experience-level"
                  value={experienceLevel}
                  onChange={(e) =>
                    setExperienceLevel(e.target.value as typeof experienceLevel)
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="lead">Lead / Principal</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. Work Arrangement & Location */}
          <div className="space-y-4 border-t border-slate-200 pt-6 dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              2. Location & Work Setup
            </h2>

            {/* Remote Toggle */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Remote Position
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Allow candidates to work from anywhere or hybrid
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                id="is-remote"
                checked={isRemote}
                onChange={(e) => setIsRemote(e.target.checked)}
                className="h-5 w-5 rounded-md border-slate-300 text-cyan-600 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>

            {/* Locations Tag Input */}
            <div>
              <label
                htmlFor="location-input"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Locations / Hubs{" "}
                {!isRemote && <span className="text-rose-500">*</span>}
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  id="location-input"
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addLocation(locationInput);
                    }
                  }}
                  placeholder="e.g. San Francisco, CA or London, UK"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => addLocation(locationInput)}
                  className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Add
                </button>
              </div>
              {fieldErrors.location && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                  {fieldErrors.location}
                </p>
              )}

              {/* Tag display */}
              {locations.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {locations.map((loc) => (
                    <span
                      key={loc}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <MapPin className="h-3 w-3 text-cyan-600 dark:text-cyan-400" />
                      {loc}
                      <button
                        type="button"
                        onClick={() => removeLocation(loc)}
                        className="rounded-full p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 3. Required Skills */}
          <div className="space-y-4 border-t border-slate-200 pt-6 dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              3. Required Skills & Competencies
            </h2>

            <div>
              <label
                htmlFor="skill-input"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Add Required Skills (Press Enter to add)
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  id="skill-input"
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill(skillInput);
                    }
                  }}
                  placeholder="e.g. React, TypeScript, Docker..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => addSkill(skillInput)}
                  className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Add
                </button>
              </div>

              {/* Selected skills */}
              {skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="rounded-full p-0.5 hover:bg-cyan-200/60 dark:hover:bg-cyan-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Quick suggestions */}
              <div className="mt-3">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Popular suggestions:
                </span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {POPULAR_SKILLS.filter((s) => !skills.includes(s)).map(
                    (s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => addSkill(s)}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600 transition hover:border-cyan-500 hover:text-cyan-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                      >
                        <Plus className="h-3 w-3" />
                        {s}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Compensation */}
          <div className="space-y-4 border-t border-slate-200 pt-6 dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              4. Compensation Range (Optional)
            </h2>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="currency"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Currency
                </label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="salary-min"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Minimum Annual Pay
                </label>
                <input
                  id="salary-min"
                  type="number"
                  min="0"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="e.g. 90000"
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="salary-max"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Maximum Annual Pay
                </label>
                <input
                  id="salary-max"
                  type="number"
                  min="0"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  placeholder="e.g. 130000"
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>
            {fieldErrors.salaryRange && (
              <p className="text-xs text-rose-600 dark:text-rose-400">
                {fieldErrors.salaryRange}
              </p>
            )}
          </div>

          {/* 5. Description */}
          <div className="space-y-4 border-t border-slate-200 pt-6 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                5. Job Description & Responsibilities{" "}
                <span className="text-rose-500">*</span>
              </h2>
              <span
                className={`text-xs ${
                  description.length > 1000
                    ? "font-bold text-rose-500"
                    : "text-slate-400"
                }`}
              >
                {description.length} / 1000 characters
              </span>
            </div>

            <div>
              <textarea
                id="job-description"
                required
                rows={6}
                maxLength={1000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Outline core responsibilities, qualifications, tech stack, and what makes your team exceptional..."
                className={`w-full rounded-xl border p-4 text-sm text-slate-900 transition outline-none dark:bg-slate-950 dark:text-white ${
                  fieldErrors.description
                    ? "border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    : "border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700"
                }`}
              />
              {fieldErrors.description && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                  {fieldErrors.description}
                </p>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col-reverse items-center justify-end gap-3 border-t border-slate-200 pt-6 sm:flex-row dark:border-slate-800">
            <Link
              href="/recruiter/jobs"
              className="w-full rounded-xl border border-slate-300 px-5 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </Link>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(false)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-xs transition hover:bg-slate-50 disabled:opacity-50 sm:w-auto dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {isSubmitting && actionType === "draft" && (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              )}
              Save as Draft
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-cyan-600 via-cyan-600 to-cyan-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-cyan-600/25 transition hover:from-cyan-500 hover:to-cyan-600 hover:shadow-lg active:scale-[0.98] disabled:opacity-50 sm:w-auto"
            >
              {isSubmitting && actionType === "publish" ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Publish Job
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
