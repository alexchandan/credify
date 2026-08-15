"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Sparkles,
  FileText,
  History,
  GraduationCap,
  Briefcase,
  Rocket,
  Award,
  Link2,
  Save,
  ShieldAlert,
  Eye,
  EyeOff,
  Camera,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  ChevronDown,
  ExternalLink,
  LoaderCircle,
} from "lucide-react";
import { apiRequest, ApiError } from "@/lib/apiClient";
import { getErrorMessage } from "@/lib/formErrors";
import { useAuth } from "@/context/AuthContext";
import CandidateProfileSkeleton from "@/../src/components/ui/skeletons/CandidateProfileSkeletons";
import {
  type CandidateProfile,
  type Education,
  type Experience,
  type ProjectEntry,
  type Certification,
  type Availability,
  AVAILABILITY_OPTIONS,
} from "@/types/candidate";

// Mirrors dashboard.service.ts's calculateProfileCompletion() exactly, so
// the number shown here always matches what the candidate dashboard shows
// elsewhere — computed client-side from data already fetched, rather than
// a second API call to the dashboard endpoint just for this one number.
function calculateProfileStrength(profile: CandidateProfile): number {
  const checks = [
    Boolean(profile.headline),
    profile.skills.length > 0,
    Boolean(profile.location),
    Boolean(profile.resumeUrl),
    profile.education.length > 0,
    profile.experience.length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function strengthLabel(percent: number): string {
  if (percent >= 90) return "All-Star";
  if (percent >= 60) return "Intermediate";
  if (percent >= 30) return "Getting Started";
  return "Just Beginning";
}

function editableProfile(profile: CandidateProfile) {
  return {
    fullName: profile.fullName,
    headline: profile.headline,
    location: profile.location,
    availability: profile.availability,
    skills: profile.skills,
    education: profile.education,
    experience: profile.experience,
    projects: profile.projects,
    certifications: profile.certifications,
    socialLinks: profile.socialLinks,
  };
}

function validationMessage(error: unknown): string {
  if (error instanceof ApiError && error.details.length > 0) {
    return error.details[0] ?? error.message;
  }
  return getErrorMessage(error);
}

export default function CandidateProfilePage() {
  const { user, updateUser } = useAuth();

  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [savedProfile, setSavedProfile] = useState<CandidateProfile | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isRemovingResume, setIsRemovingResume] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);

  useEffect(() => {
    // No manual auth/role check needed here — this page lives under the
    // (candidate) route group, whose layout.tsx wraps it in RequireRole.
    // By the time this component ever renders, a logged-in candidate is
    // already guaranteed.
    apiRequest<CandidateProfile>("/candidates/me")
      .then((result) => {
        setProfile(result.data);
        setSavedProfile(result.data);
        updateUser({
          fullName: result.data.fullName,
          avatarUrl: result.data.avatarUrl,
        });
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, [updateUser]);

  const isDirty = Boolean(
    profile &&
    savedProfile &&
    JSON.stringify(editableProfile(profile)) !==
      JSON.stringify(editableProfile(savedProfile)),
  );

  useEffect(() => {
    function warnBeforeUnload(event: BeforeUnloadEvent) {
      if (!isDirty) return;
      event.preventDefault();
    }
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [isDirty]);

  async function handleSave() {
    if (!profile) return;
    setNotice(null);
    if (!profile.fullName.trim()) {
      setNotice({ type: "error", message: "Full name is required." });
      return;
    }
    setIsSaving(true);
    try {
      const result = await apiRequest<CandidateProfile>("/candidates/me", {
        method: "PATCH",
        body: editableProfile(profile),
      });
      setProfile(result.data);
      setSavedProfile(result.data);
      updateUser({
        fullName: result.data.fullName,
        avatarUrl: result.data.avatarUrl,
      });
      setNotice({ type: "success", message: "Profile saved." });
    } catch (err) {
      setNotice({ type: "error", message: validationMessage(err) });
    } finally {
      setIsSaving(false);
    }
  }

  function mergeUploadedAssets(next: CandidateProfile) {
    setProfile((current) =>
      current
        ? {
            ...current,
            avatarUrl: next.avatarUrl,
            avatarPublicId: next.avatarPublicId,
            avatarUploadedAt: next.avatarUploadedAt,
            resumeUrl: next.resumeUrl,
            resumePublicId: next.resumePublicId,
            resumeUploadedAt: next.resumeUploadedAt,
          }
        : next,
    );
    setSavedProfile((current) =>
      current
        ? {
            ...current,
            avatarUrl: next.avatarUrl,
            avatarPublicId: next.avatarPublicId,
            avatarUploadedAt: next.avatarUploadedAt,
            resumeUrl: next.resumeUrl,
            resumePublicId: next.resumePublicId,
            resumeUploadedAt: next.resumeUploadedAt,
          }
        : next,
    );
  }

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" || file.size > 5 * 1024 * 1024) {
      setNotice({
        type: "error",
        message: "Choose a PDF resume no larger than 5 MB.",
      });
      e.target.value = "";
      return;
    }

    setIsUploadingResume(true);
    setNotice(null);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const result = await apiRequest<CandidateProfile>(
        "/candidates/me/resume",
        {
          method: "POST",
          body: formData,
        },
      );
      mergeUploadedAssets(result.data);
      setNotice({ type: "success", message: "Resume uploaded." });
    } catch (err) {
      if (err instanceof ApiError && err.code === "INVALID_FILE_TYPE") {
        setNotice({ type: "error", message: "Only PDF files are allowed." });
      } else {
        setNotice({ type: "error", message: getErrorMessage(err) });
      }
    } finally {
      setIsUploadingResume(false);
      if (resumeInputRef.current) resumeInputRef.current.value = "";
    }
  }

  async function handleResumeRemove() {
    setIsRemovingResume(true);
    setNotice(null);
    try {
      const result = await apiRequest<CandidateProfile>(
        "/candidates/me/resume",
        {
          method: "DELETE",
        },
      );
      mergeUploadedAssets(result.data);
      setNotice({ type: "success", message: "Resume removed." });
    } catch (err) {
      setNotice({ type: "error", message: getErrorMessage(err) });
    } finally {
      setIsRemovingResume(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!allowedTypes.has(file.type) || file.size > 3 * 1024 * 1024) {
      setNotice({
        type: "error",
        message: "Choose a JPEG, PNG, or WebP image no larger than 3 MB.",
      });
      e.target.value = "";
      return;
    }

    setIsUploadingAvatar(true);
    setNotice(null);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const result = await apiRequest<CandidateProfile>(
        "/candidates/me/avatar",
        {
          method: "POST",
          body: formData,
        },
      );
      mergeUploadedAssets(result.data);
      updateUser({
        fullName: profile?.fullName,
        avatarUrl: result.data.avatarUrl,
      });
      setNotice({ type: "success", message: "Profile photo updated." });
    } catch (err) {
      setNotice({ type: "error", message: getErrorMessage(err) });
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  }

  async function handleAvatarRemove() {
    setIsRemovingAvatar(true);
    setNotice(null);
    try {
      const result = await apiRequest<CandidateProfile>(
        "/candidates/me/avatar",
        {
          method: "DELETE",
        },
      );
      mergeUploadedAssets(result.data);
      updateUser({ fullName: profile?.fullName, avatarUrl: undefined });
      setNotice({ type: "success", message: "Profile photo removed." });
    } catch (err) {
      setNotice({ type: "error", message: getErrorMessage(err) });
    } finally {
      setIsRemovingAvatar(false);
    }
  }

  if (isLoading) {
    return <CandidateProfileSkeleton />;
  }
  if (error || !profile) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-red-600 dark:text-red-400">
        {error ?? "Profile not found."}
      </div>
    );
  }

  const strength = calculateProfileStrength(profile);

  return (
    <div className="flex flex-1 flex-col bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 pb-28 sm:px-6">
        <div className="border-b border-slate-200 pb-6 dark:border-slate-800">
          <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">
            Candidate profile
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">
            Build a profile recruiters can trust
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Keep your experience, skills, links, and application resume
            accurate.
          </p>
        </div>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="space-y-4 lg:sticky lg:top-24">
            <section className="rounded-lg border border-slate-200 bg-white p-5 text-center dark:border-slate-800 dark:bg-slate-950">
              <div className="relative mx-auto h-28 w-28">
                {profile.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt={`${profile.fullName}'s profile photo`}
                    fill
                    sizes="112px"
                    className="rounded-full object-cover ring-4 ring-orange-100 dark:ring-orange-950"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-orange-100 text-3xl font-bold text-orange-700 ring-4 ring-orange-50 dark:bg-orange-950 dark:text-orange-300 dark:ring-orange-950/50">
                    {profile.fullName[0]?.toUpperCase() ?? "U"}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar || isRemovingAvatar}
                  title="Change profile photo"
                  aria-label="Change profile photo"
                  className="absolute right-0 bottom-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-orange-600 text-white shadow-sm hover:bg-orange-700 disabled:opacity-50 dark:border-slate-950"
                >
                  {isUploadingAvatar ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>
              </div>
              <h2 className="mt-4 truncate text-lg font-semibold text-slate-950 dark:text-white">
                {profile.fullName}
              </h2>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                {profile.headline || "Add a professional headline"}
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar || isRemovingAvatar}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {profile.avatarUrl ? "Replace" : "Upload"}
                </button>
                {profile.avatarUrl && (
                  <button
                    type="button"
                    onClick={handleAvatarRemove}
                    disabled={isUploadingAvatar || isRemovingAvatar}
                    title="Remove profile photo"
                    aria-label="Remove profile photo"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
                  >
                    {isRemovingAvatar ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
                JPEG, PNG, or WebP. Maximum 3 MB.
              </p>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Profile strength
                </span>
                <span className="font-semibold text-orange-700 dark:text-orange-400">
                  {strength}%
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-orange-600 transition-all"
                  style={{ width: `${strength}%` }}
                />
              </div>
              <p className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                {strengthLabel(strength)}
              </p>
              {strength < 100 && (
                <p className="mt-1 text-xs leading-5 text-slate-400 dark:text-slate-500">
                  Complete the missing sections to improve recruiter visibility.
                </p>
              )}
            </section>

            <nav
              aria-label="Profile sections"
              className="hidden border-l border-slate-200 pl-4 text-sm lg:flex lg:flex-col lg:gap-2 dark:border-slate-800"
            >
              {[
                ["#basic-information", "Basic information"],
                ["#skills", "Skills"],
                ["#resume", "Resume"],
                ["#history", "Experience and education"],
                ["#links", "Professional links"],
                ["#account-settings", "Account settings"],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  className="text-slate-500 hover:text-orange-700 dark:text-slate-400 dark:hover:text-orange-400"
                >
                  {label}
                </a>
              ))}
            </nav>
          </aside>

          <div className="min-w-0">
            {/* --- General Info --- */}
            <Card
              id="basic-information"
              icon={UserIcon}
              title="Basic information"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                  label="Full Name"
                  value={profile.fullName}
                  onChange={(v) => setProfile({ ...profile, fullName: v })}
                />
                <TextField
                  label="Headline"
                  value={profile.headline ?? ""}
                  onChange={(v) => setProfile({ ...profile, headline: v })}
                />
                <TextField
                  label="Location"
                  value={profile.location ?? ""}
                  onChange={(v) => setProfile({ ...profile, location: v })}
                />
                <div>
                  <label
                    htmlFor="candidate-availability"
                    className="block text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
                  >
                    Availability
                  </label>
                  <select
                    id="candidate-availability"
                    value={profile.availability}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        availability: e.target.value as Availability,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-orange-500 focus:outline-none dark:border-slate-700 dark:text-slate-100"
                  >
                    {AVAILABILITY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {/* --- Account (read-only email) --- */}
            <Card icon={UserIcon} title="Account">
              <div>
                <label
                  htmlFor="candidate-account-email"
                  className="block text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
                >
                  Email
                </label>
                <input
                  id="candidate-account-email"
                  type="email"
                  value={user?.email ?? ""}
                  disabled
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                />
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  Your email is tied to your account and can&apos;t be changed
                  here.
                </p>
              </div>
            </Card>

            {/* --- Skills --- */}
            <Card id="skills" icon={Sparkles} title="Skills">
              <SkillsEditor
                skills={profile.skills}
                onChange={(skills) => setProfile({ ...profile, skills })}
              />
            </Card>

            {/* --- Resume --- */}
            <Card id="resume" icon={FileText} title="Application resume">
              {profile.resumeUrl ? (
                <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-orange-700 dark:bg-slate-950 dark:text-orange-400">
                      <FileText className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <a
                        href={profile.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-sm font-semibold text-slate-900 hover:underline dark:text-slate-100"
                      >
                        Candidate resume.pdf
                      </a>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {profile.resumeUploadedAt
                          ? `Uploaded on ${new Date(profile.resumeUploadedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}`
                          : "Upload date unavailable"}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <a
                      href={profile.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open current resume"
                      aria-label="Open current resume"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-white dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => resumeInputRef.current?.click()}
                      disabled={isUploadingResume || isRemovingResume}
                      className="inline-flex h-9 items-center gap-2 rounded-lg bg-orange-600 px-3 text-xs font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
                    >
                      {isUploadingResume ? (
                        <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Upload className="h-3.5 w-3.5" />
                      )}
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={handleResumeRemove}
                      disabled={isUploadingResume || isRemovingResume}
                      title="Remove resume"
                      aria-label="Remove resume"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
                    >
                      {isRemovingResume ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-900">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Add your application resume
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      A PDF resume is required before applying to jobs. Maximum
                      5 MB.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => resumeInputRef.current?.click()}
                    disabled={isUploadingResume}
                    className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-orange-600 px-4 text-xs font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
                  >
                    {isUploadingResume ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Upload resume
                  </button>
                </div>
              )}
              <input
                ref={resumeInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleResumeUpload}
                className="hidden"
              />
            </Card>

            {/* --- Detailed History --- */}
            <Card id="history" icon={History} title="Experience and education">
              <div className="flex flex-col gap-3">
                <ListEditor<Education>
                  title="Education"
                  icon={GraduationCap}
                  items={profile.education}
                  onChange={(education) =>
                    setProfile({ ...profile, education })
                  }
                  emptyItem={{ institution: "", degree: "", startDate: "" }}
                  isDraftValid={(item) =>
                    Boolean(
                      item.institution.trim() &&
                      item.degree.trim() &&
                      item.startDate,
                    )
                  }
                  renderSummary={(e) =>
                    e.institution
                      ? `${e.degree} — ${e.institution}`
                      : "New education entry"
                  }
                  renderFields={(item, update) => (
                    <>
                      <TextField
                        label="Institution"
                        value={item.institution}
                        onChange={(v) => update({ institution: v })}
                      />
                      <TextField
                        label="Degree"
                        value={item.degree}
                        onChange={(v) => update({ degree: v })}
                      />
                      <TextField
                        label="Field of study"
                        value={item.fieldOfStudy ?? ""}
                        onChange={(v) => update({ fieldOfStudy: v })}
                      />
                      <TextField
                        label="Grade or score"
                        value={item.grade ?? ""}
                        onChange={(v) => update({ grade: v })}
                      />
                      <DateField
                        label="Start date"
                        value={item.startDate}
                        onChange={(v) => update({ startDate: v })}
                      />
                      <DateField
                        label="End date"
                        value={item.endDate ?? ""}
                        onChange={(v) => update({ endDate: v })}
                      />
                    </>
                  )}
                />
                <ListEditor<Experience>
                  title="Experience"
                  icon={Briefcase}
                  items={profile.experience}
                  onChange={(experience) =>
                    setProfile({ ...profile, experience })
                  }
                  emptyItem={{
                    company: "",
                    title: "",
                    startDate: "",
                    isCurrent: false,
                  }}
                  isDraftValid={(item) =>
                    Boolean(
                      item.company.trim() &&
                      item.title.trim() &&
                      item.startDate,
                    )
                  }
                  renderSummary={(e) =>
                    e.company
                      ? `${e.title} at ${e.company}`
                      : "New experience entry"
                  }
                  renderFields={(item, update) => (
                    <>
                      <TextField
                        label="Company"
                        value={item.company}
                        onChange={(v) => update({ company: v })}
                      />
                      <TextField
                        label="Title"
                        value={item.title}
                        onChange={(v) => update({ title: v })}
                      />
                      <DateField
                        label="Start date"
                        value={item.startDate}
                        onChange={(v) => update({ startDate: v })}
                      />
                      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                        <input
                          type="checkbox"
                          checked={item.isCurrent}
                          onChange={(e) =>
                            update({
                              isCurrent: e.target.checked,
                              ...(e.target.checked
                                ? { endDate: undefined }
                                : {}),
                            })
                          }
                        />
                        Current role
                      </label>
                      {!item.isCurrent && (
                        <DateField
                          label="End date"
                          value={item.endDate ?? ""}
                          onChange={(v) => update({ endDate: v })}
                        />
                      )}
                      <TextAreaField
                        label="Description"
                        value={item.description ?? ""}
                        onChange={(v) => update({ description: v })}
                      />
                    </>
                  )}
                />
                <ListEditor<ProjectEntry>
                  title="Projects"
                  icon={Rocket}
                  items={profile.projects}
                  onChange={(projects) => setProfile({ ...profile, projects })}
                  emptyItem={{ title: "", techStack: [] }}
                  isDraftValid={(item) => Boolean(item.title.trim())}
                  renderSummary={(p) => p.title || "New project"}
                  renderFields={(item, update) => (
                    <>
                      <TextField
                        label="Title"
                        value={item.title}
                        onChange={(v) => update({ title: v })}
                      />
                      <TextAreaField
                        label="Description"
                        value={item.description ?? ""}
                        onChange={(v) => update({ description: v })}
                      />
                      <TextField
                        label="Tech stack (comma separated)"
                        value={item.techStack.join(", ")}
                        onChange={(v) =>
                          update({
                            techStack: v
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                      />
                      <TextField
                        label="Project URL"
                        type="url"
                        value={item.link ?? ""}
                        onChange={(v) => update({ link: v })}
                      />
                    </>
                  )}
                />
                <ListEditor<Certification>
                  title="Certifications"
                  icon={Award}
                  items={profile.certifications}
                  onChange={(certifications) =>
                    setProfile({ ...profile, certifications })
                  }
                  emptyItem={{ name: "", issuingOrg: "", issueDate: "" }}
                  isDraftValid={(item) =>
                    Boolean(
                      item.name.trim() &&
                      item.issuingOrg.trim() &&
                      item.issueDate,
                    )
                  }
                  renderSummary={(c) =>
                    c.name ? `${c.name} — ${c.issuingOrg}` : "New certification"
                  }
                  renderFields={(item, update) => (
                    <>
                      <TextField
                        label="Name"
                        value={item.name}
                        onChange={(v) => update({ name: v })}
                      />
                      <TextField
                        label="Issuing organization"
                        value={item.issuingOrg}
                        onChange={(v) => update({ issuingOrg: v })}
                      />
                      <DateField
                        label="Issue date"
                        value={item.issueDate}
                        onChange={(v) => update({ issueDate: v })}
                      />
                      <DateField
                        label="Expiry date"
                        value={item.expiryDate ?? ""}
                        onChange={(v) => update({ expiryDate: v })}
                      />
                      <TextField
                        label="Credential URL"
                        type="url"
                        value={item.credentialUrl ?? ""}
                        onChange={(v) => update({ credentialUrl: v })}
                      />
                    </>
                  )}
                />
              </div>
            </Card>

            {/* --- Professional Links --- */}
            <Card id="links" icon={Link2} title="Professional links">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                  label="LinkedIn"
                  type="url"
                  value={profile.socialLinks?.linkedIn ?? ""}
                  onChange={(v) =>
                    setProfile({
                      ...profile,
                      socialLinks: { ...profile.socialLinks, linkedIn: v },
                    })
                  }
                />
                <TextField
                  label="GitHub"
                  type="url"
                  value={profile.socialLinks?.github ?? ""}
                  onChange={(v) =>
                    setProfile({
                      ...profile,
                      socialLinks: { ...profile.socialLinks, github: v },
                    })
                  }
                />
                <TextField
                  label="Portfolio"
                  type="url"
                  value={profile.socialLinks?.portfolio ?? ""}
                  onChange={(v) =>
                    setProfile({
                      ...profile,
                      socialLinks: { ...profile.socialLinks, portfolio: v },
                    })
                  }
                />
                <TextField
                  label="Twitter"
                  type="url"
                  value={profile.socialLinks?.twitter ?? ""}
                  onChange={(v) =>
                    setProfile({
                      ...profile,
                      socialLinks: { ...profile.socialLinks, twitter: v },
                    })
                  }
                />
              </div>
            </Card>

            {/* --- Account Settings (change password / delete account) --- */}
            <AccountSettingsSection />
          </div>
        </div>
      </div>

      {/* --- Sticky Save Bar --- */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 sm:justify-end">
          <div className="min-w-0" aria-live="polite">
            {notice ? (
              <span
                className={`flex items-center gap-2 truncate text-sm ${notice.type === "error" ? "text-red-600 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400"}`}
              >
                {notice.type === "error" ? (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                )}
                {notice.message}
              </span>
            ) : isDirty ? (
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Unsaved changes
              </span>
            ) : (
              <span className="hidden text-sm text-slate-400 sm:inline dark:text-slate-500">
                All changes saved
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              if (savedProfile) {
                setProfile(savedProfile);
                setNotice(null);
              }
            }}
            disabled={!isDirty || isSaving}
            className="hidden h-10 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:inline-flex sm:items-center dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className="flex h-10 shrink-0 items-center gap-2 rounded-lg bg-orange-600 px-5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? "Saving..." : "Save profile"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Shared page pieces
// ---------------------------------------------------------------------

function Card({
  id,
  icon: Icon,
  title,
  children,
}: {
  id?: string;
  icon: typeof UserIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="mb-4 scroll-mt-24 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950"
    >
      <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
        <Icon
          className="h-4 w-4 text-orange-700 dark:text-orange-400"
          strokeWidth={2}
        />
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "url";
}) {
  const id = useId();
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-orange-500 focus:outline-none dark:border-slate-700 dark:text-slate-100"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const id = useId();
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
      >
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        rows={4}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-orange-500 focus:outline-none dark:border-slate-700 dark:text-slate-100"
      />
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const id = useId();
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
      >
        {label}
      </label>
      <input
        id={id}
        type="date"
        value={value ? value.slice(0, 10) : ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-orange-500 focus:outline-none dark:border-slate-700 dark:text-slate-100"
      />
    </div>
  );
}

function SkillsEditor({
  skills,
  onChange,
}: {
  skills: string[];
  onChange: (skills: string[]) => void;
}) {
  const [input, setInput] = useState("");

  function addSkill() {
    const trimmed = input.trim().toLowerCase();
    if (trimmed && !skills.some((skill) => skill.toLowerCase() === trimmed)) {
      onChange([...skills, trimmed]);
    }
    setInput("");
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
        {skills.map((skill) => (
          <span
            key={skill}
            className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 dark:bg-orange-950/40 dark:text-orange-400"
          >
            {skill}
            <button
              type="button"
              onClick={() => onChange(skills.filter((s) => s !== skill))}
              aria-label={`Remove ${skill}`}
              title={`Remove ${skill}`}
              className="text-orange-500 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {skills.length === 0 && (
          <span className="text-sm text-slate-400 dark:text-slate-500">
            No skills added yet.
          </span>
        )}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSkill();
            }
          }}
          placeholder="Type a skill and press enter..."
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none dark:border-slate-700"
        />
        <button
          type="button"
          onClick={addSkill}
          disabled={!input.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-700 hover:bg-orange-100 disabled:opacity-50 dark:bg-orange-950/40 dark:text-orange-400 dark:hover:bg-orange-900/60"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>
    </div>
  );
}

function ListEditor<T extends object>({
  title,
  icon: Icon,
  items,
  onChange,
  emptyItem,
  isDraftValid,
  renderSummary,
  renderFields,
}: {
  title: string;
  icon: typeof GraduationCap;
  items: T[];
  onChange: (items: T[]) => void;
  emptyItem: T;
  isDraftValid: (item: T) => boolean;
  renderSummary: (item: T) => string;
  renderFields: (
    item: T,
    update: (patch: Partial<T>) => void,
  ) => React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<T>(emptyItem);
  const [isAdding, setIsAdding] = useState(false);

  function updateExisting(index: number, patch: Partial<T>) {
    const next = [...items];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  function removeExisting(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addDraft() {
    onChange([...items, draft]);
    setDraft(emptyItem);
    setIsAdding(false);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between bg-slate-50 px-4 py-3 text-left dark:bg-slate-900"
      >
        <span className="flex items-center gap-2 font-medium text-slate-900 dark:text-slate-100">
          <Icon className="h-4 w-4 text-orange-700 dark:text-orange-400" />
          {title}
          <span className="text-xs font-normal text-slate-400 dark:text-slate-500">
            ({items.length})
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition dark:text-slate-500 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="flex flex-col gap-3 p-4">
          {items.map((item, index) => (
            <details
              key={index}
              className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm text-slate-700 dark:text-slate-200">
                <span className="min-w-0 truncate">{renderSummary(item)}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    removeExisting(index);
                  }}
                  aria-label={`Remove ${renderSummary(item)}`}
                  title={`Remove ${renderSummary(item)}`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </summary>
              <div className="mt-3 flex flex-col gap-2">
                {renderFields(item, (patch) => updateExisting(index, patch))}
              </div>
            </details>
          ))}

          {isAdding ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-3 dark:border-slate-700">
              <div className="flex flex-col gap-2">
                {renderFields(draft, (patch) =>
                  setDraft({ ...draft, ...patch }),
                )}
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={addDraft}
                  disabled={!isDraftValid(draft)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-orange-600 px-3 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setDraft(emptyItem);
                  }}
                  className="h-9 rounded-lg border border-slate-300 px-3 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-1.5 text-left text-sm font-semibold text-orange-700 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
            >
              <Plus className="h-4 w-4" />
              Add {title.toLowerCase()}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// Account Settings — the "must" section: change password + delete account
// ---------------------------------------------------------------------

function AccountSettingsSection() {
  return (
    <section
      id="account-settings"
      className="mb-4 scroll-mt-24 rounded-lg border border-red-200 bg-white p-5 dark:border-red-800 dark:bg-slate-950"
    >
      <div className="mb-4 flex items-center gap-2 border-b border-red-100 pb-3 dark:border-red-900">
        <ShieldAlert
          className="h-4 w-4 text-red-600 dark:text-red-400"
          strokeWidth={2}
        />
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Account Settings
        </h2>
      </div>
      <div className="flex flex-col gap-6">
        <ChangePasswordForm />
        <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
          <DeleteAccountForm />
        </div>
      </div>
    </section>
  );
}

function ChangePasswordForm() {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
        Change Password
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="relative">
          <input
            type={showPasswords ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-10 text-sm focus:border-orange-500 focus:outline-none dark:border-slate-700"
          />
        </div>
        <div className="relative">
          <input
            type={showPasswords ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password (8–15 characters)"
            required
            minLength={8}
            maxLength={15}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-10 text-sm focus:border-orange-500 focus:outline-none dark:border-slate-700"
          />
          <button
            type="button"
            onClick={() => setShowPasswords((v) => !v)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          >
            {showPasswords ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {success && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          Password changed. You&apos;ve been logged out of all other sessions.
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-fit rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        {isSubmitting ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}

function DeleteAccountForm() {
  const { deleteAccount } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleDelete() {
    setError(null);
    setIsSubmitting(true);
    try {
      await deleteAccount(password);
      router.replace("/");
    } catch (err) {
      setError(getErrorMessage(err));
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-red-700 dark:text-red-300">
        Delete Account
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        This permanently deactivates your account and profile. This cannot be
        undone from within the app.
      </p>

      {!confirmOpen ? (
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="w-fit rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950/50"
        >
          Delete My Account
        </button>
      ) : (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/40">
          <p className="text-sm font-medium text-red-800 dark:text-red-300">
            Enter your password to confirm. This is permanent.
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            className="mt-2 w-full rounded-lg border border-red-300 px-3 py-2.5 text-sm focus:outline-none dark:border-red-700"
          />
          {error && (
            <p className="mt-2 text-sm text-red-700 dark:text-red-300">
              {error}
            </p>
          )}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting || !password}
              className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-50"
            >
              {isSubmitting
                ? "Deleting..."
                : "Yes, permanently delete my account"}
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmOpen(false);
                setPassword("");
                setError(null);
              }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
