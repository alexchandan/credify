"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Globe,
  LoaderCircle,
  MapPin,
  Plus,
  Save,
  X,
  AlertCircle,
} from "lucide-react";
import { apiRequest } from "@/lib/apiClient";
import { getErrorMessage, parseFieldErrors } from "@/lib/formErrors";
import { JobFormSkeleton } from "@/components/ui/skeletons";
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

export default function EditJobPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const res = await apiRequest<Job>(`/jobs/${id}`);
        const job = res.data;
        setTitle(job.title);
        setEmploymentType(job.employmentType);
        setExperienceLevel(job.experienceLevel);
        setIsRemote(job.isRemote);
        setLocations(job.location || []);
        setSkills(job.skillsRequired || []);
        setDescription(job.description || "");
        if (job.salaryRange) {
          setSalaryMin(job.salaryRange.min?.toString() || "");
          setSalaryMax(job.salaryRange.max?.toString() || "");
          setCurrency(job.salaryRange.currency || "USD");
        }
      } catch (err) {
        setLoadError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      load();
    }
  }, [id]);

  function addSkill(skillToAdd: string) {
    const trimmed = skillToAdd.trim();
    if (!trimmed || skills.includes(trimmed)) return;
    setSkills((prev) => [...prev, trimmed]);
    setSkillInput("");
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

  async function handleSave() {
    setFieldErrors({});
    setGeneralError(null);

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

      await apiRequest(`/jobs/${id}`, {
        method: "PATCH",
        body: payload,
      });

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
    }
  }

  if (isLoading) {
    return <JobFormSkeleton />;
  }

  if (loadError) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
        <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
          Job not found
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {loadError}
        </p>
        <Link
          href="/recruiter/jobs"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Back to all jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/recruiter/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 transition hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all jobs
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-300">
          <BriefcaseBusiness className="h-3.5 w-3.5" />
          Edit Job Listing
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          Update Job Details
        </h1>
        <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
          Modify qualifications, compensation, or job requirements.
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
            handleSave();
          }}
          className="mt-8 space-y-8"
        >
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              1. Basic Position Info
            </h2>

            <div>
              <label
                htmlFor="edit-job-title"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Job Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="edit-job-title"
                type="text"
                required
                maxLength={150}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 transition outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
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
                  htmlFor="edit-employment-type"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Employment Type
                </label>
                <select
                  id="edit-employment-type"
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
                  htmlFor="edit-experience-level"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Experience Level
                </label>
                <select
                  id="edit-experience-level"
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

          {/* Location & Work Setup */}
          <div className="space-y-4 border-t border-slate-200 pt-6 dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              2. Location & Work Setup
            </h2>

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
                id="edit-is-remote"
                checked={isRemote}
                onChange={(e) => setIsRemote(e.target.checked)}
                className="h-5 w-5 rounded-md border-slate-300 text-cyan-600 focus:ring-cyan-500 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>

            <div>
              <label
                htmlFor="edit-location-input"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Locations / Hubs{" "}
                {!isRemote && <span className="text-rose-500">*</span>}
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  id="edit-location-input"
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

          {/* Required Skills */}
          <div className="space-y-4 border-t border-slate-200 pt-6 dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              3. Required Skills & Competencies
            </h2>

            <div>
              <div className="flex gap-2">
                <input
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

              <div className="mt-3 flex flex-wrap gap-1.5">
                {POPULAR_SKILLS.filter((s) => !skills.includes(s)).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addSkill(s)}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600 transition hover:border-cyan-500 hover:text-cyan-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                  >
                    <Plus className="h-3 w-3" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Compensation */}
          <div className="space-y-4 border-t border-slate-200 pt-6 dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              4. Compensation Range (Optional)
            </h2>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="edit-currency"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Currency
                </label>
                <select
                  id="edit-currency"
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
                  htmlFor="edit-salary-min"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Minimum Annual Pay
                </label>
                <input
                  id="edit-salary-min"
                  type="number"
                  min="0"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-salary-max"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Maximum Annual Pay
                </label>
                <input
                  id="edit-salary-max"
                  type="number"
                  min="0"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Description */}
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
                id="edit-job-description"
                required
                rows={6}
                maxLength={1000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-4 text-sm text-slate-900 transition outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
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
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-cyan-600 via-cyan-600 to-cyan-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-cyan-600/25 transition hover:from-cyan-500 hover:to-cyan-600 hover:shadow-lg active:scale-[0.98] disabled:opacity-50 sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
