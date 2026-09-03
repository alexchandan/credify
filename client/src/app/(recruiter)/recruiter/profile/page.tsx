"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useMemo } from "react";
import {
  AlertCircle,
  Briefcase,
  Building2,
  Camera,
  CheckCircle2,
  Globe,
  LoaderCircle,
  LogOut,
  Save,
  Shield,
  Sparkles,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { AccountSettingsSection } from "@/components/account/AccountSettingsSection";
import RecruiterProfileSkeleton from "@/components/ui/skeletons/RecruiterProfileSkeleton";
import { useAuth } from "@/context/AuthContext";
import { ApiError, apiRequest } from "@/lib/apiClient";
import { getErrorMessage } from "@/lib/formErrors";
import {
  COMPANY_SIZE_OPTIONS,
  type Company,
  type RecruiterProfile,
} from "@/types/recruiter";

type CompanyDraft = {
  name: string;
  description: string;
  industry: string;
  websiteUrl: string;
  size: Company["size"] | "";
};

const emptyCompany: CompanyDraft = {
  name: "",
  description: "",
  industry: "",
  websiteUrl: "",
  size: "",
};

function draftFromCompany(company: Company): CompanyDraft {
  return {
    name: company.name,
    description: company.description ?? "",
    industry: company.industry ?? "",
    websiteUrl: company.websiteUrl ?? "",
    size: company.size ?? "",
  };
}

export default function RecruiterProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [savedProfile, setSavedProfile] = useState<RecruiterProfile | null>(
    null,
  );
  const [company, setCompany] = useState<Company | null>(null);
  const [companyDraft, setCompanyDraft] = useState<CompanyDraft>(emptyCompany);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [leaveConfirm, setLeaveConfirm] = useState(false);
  const [leavingCompany, setLeavingCompany] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const result = await apiRequest<RecruiterProfile>("/recruiters/me", {
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        setProfile(result.data);
        setSavedProfile(result.data);
        updateUser({ fullName: result.data.fullName });

        if (result.data.companyId) {
          const companyResult = await apiRequest<Company>(
            `/companies/${result.data.companyId}`,
            { signal: controller.signal },
          );
          if (!controller.signal.aborted) {
            setCompany(companyResult.data);
            setCompanyDraft(draftFromCompany(companyResult.data));
          }
        }
      } catch (err) {
        if (!controller.signal.aborted) setError(getErrorMessage(err));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [updateUser]);

  const isProfileDirty = Boolean(
    profile &&
    savedProfile &&
    (profile.fullName.trim() !== savedProfile.fullName.trim() ||
      (profile.title?.trim() ?? "") !== (savedProfile.title?.trim() ?? "")),
  );

  const isCompanyDirty = useMemo(() => {
    if (!company) {
      return (
        companyDraft.name.trim() !== "" ||
        companyDraft.industry.trim() !== "" ||
        companyDraft.websiteUrl.trim() !== "" ||
        companyDraft.size !== "" ||
        companyDraft.description.trim() !== ""
      );
    }
    const current = draftFromCompany(company);
    return (
      companyDraft.name.trim() !== current.name.trim() ||
      companyDraft.industry.trim() !== current.industry.trim() ||
      companyDraft.websiteUrl.trim() !== current.websiteUrl.trim() ||
      companyDraft.size !== current.size ||
      companyDraft.description.trim() !== current.description.trim()
    );
  }, [company, companyDraft]);

  useEffect(() => {
    if (!isProfileDirty && !isCompanyDirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isProfileDirty, isCompanyDirty]);

  // Profile and organization completeness score
  const completeness = useMemo(() => {
    const checks = [
      Boolean(profile?.fullName?.trim()),
      Boolean(profile?.title?.trim()),
      Boolean(company?.name?.trim() || companyDraft.name.trim()),
      Boolean(company?.industry?.trim() || companyDraft.industry.trim()),
      Boolean(company?.websiteUrl?.trim() || companyDraft.websiteUrl.trim()),
      Boolean(company?.size || companyDraft.size),
      Boolean(company?.description?.trim() || companyDraft.description.trim()),
      Boolean(company?.logoUrl),
    ];
    const completed = checks.filter(Boolean).length;
    return Math.round((completed / checks.length) * 100);
  }, [profile, company, companyDraft]);

  async function handleSaveProfile() {
    if (!profile) return;
    if (!profile.fullName.trim()) {
      setNotice({ type: "error", message: "Full name is required." });
      return;
    }

    setSavingProfile(true);
    setNotice(null);
    try {
      const result = await apiRequest<RecruiterProfile>("/recruiters/me", {
        method: "PATCH",
        body: {
          fullName: profile.fullName.trim(),
          title: profile.title?.trim() || undefined,
        },
      });
      setProfile(result.data);
      setSavedProfile(result.data);
      updateUser({ fullName: result.data.fullName });
      setNotice({ type: "success", message: "Personal profile updated." });
    } catch (err) {
      setNotice({ type: "error", message: getErrorMessage(err) });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSaveCompany(event: React.FormEvent) {
    event.preventDefault();
    if (!companyDraft.name.trim()) {
      setNotice({ type: "error", message: "Company name is required." });
      return;
    }

    setSavingCompany(true);
    setNotice(null);
    try {
      const body = Object.fromEntries(
        Object.entries(companyDraft).filter(([, value]) => value !== ""),
      );
      const result = await apiRequest<Company>(
        company ? `/companies/${company._id}` : "/companies",
        { method: company ? "PATCH" : "POST", body },
      );
      setCompany(result.data);
      setCompanyDraft(draftFromCompany(result.data));

      if (profile && !profile.companyId) {
        const profileResult =
          await apiRequest<RecruiterProfile>("/recruiters/me");
        setProfile(profileResult.data);
        setSavedProfile(profileResult.data);
      }
      setNotice({
        type: "success",
        message: company
          ? "Company details updated successfully."
          : "Company profile created! You are now the company owner.",
      });
    } catch (err) {
      setNotice({ type: "error", message: getErrorMessage(err) });
    } finally {
      setSavingCompany(false);
    }
  }

  async function handleUploadLogo(file: File) {
    if (!company) return;

    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!allowedTypes.has(file.type) || file.size > 3 * 1024 * 1024) {
      setNotice({
        type: "error",
        message: "Please select a JPEG, PNG, or WebP logo smaller than 3 MB.",
      });
      if (logoInputRef.current) logoInputRef.current.value = "";
      return;
    }

    setUploadingLogo(true);
    setNotice(null);
    const body = new FormData();
    body.append("logo", file);
    try {
      const result = await apiRequest<Company>(
        `/companies/${company._id}/logo`,
        {
          method: "POST",
          body,
        },
      );
      setCompany(result.data);
      setNotice({
        type: "success",
        message: "Company logo updated successfully.",
      });
    } catch (err) {
      setNotice({ type: "error", message: getErrorMessage(err) });
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  }

  async function handleLeaveCompany() {
    setLeaveError(null);
    setLeavingCompany(true);
    try {
      await apiRequest("/recruiters/me/leave-company", { method: "POST" });
      setCompany(null);
      setCompanyDraft(emptyCompany);
      if (profile) {
        const nextProfile = { ...profile, companyId: null, companyRole: null };
        setProfile(nextProfile);
        setSavedProfile(nextProfile);
      }
      setLeaveConfirm(false);
      setNotice({
        type: "success",
        message: "You have successfully left the company.",
      });
    } catch (err) {
      if (
        err instanceof ApiError &&
        err.code === "RECRUITER_OWNER_MUST_TRANSFER"
      ) {
        setLeaveError(
          "You are the owner while other recruiters remain in this company. Transfer ownership before leaving.",
        );
      } else {
        setLeaveError(getErrorMessage(err));
      }
    } finally {
      setLeavingCompany(false);
    }
  }

  if (loading) {
    return <RecruiterProfileSkeleton />;
  }

  if (error || !profile) {
    return (
      <main className="flex flex-1 items-center justify-center bg-slate-50/80 px-4 py-16 sm:px-6 dark:bg-slate-950">
        <div
          role="alert"
          className="mx-auto w-full max-w-lg rounded-2xl border border-red-200/90 bg-white p-7 text-center shadow-xl shadow-red-500/5 dark:border-red-900/40 dark:bg-slate-900"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">
            Unable to load recruiter profile
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {error ??
              "An unexpected error occurred while loading your profile."}
          </p>
        </div>
      </main>
    );
  }

  const canEditCompany =
    !company ||
    profile.companyRole === "owner" ||
    profile.companyRole === "admin";

  const recruiterInitials =
    (profile.fullName || user?.email || "R")
      .split(/\s+/)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "R";

  return (
    <main className="flex-1 bg-slate-50/70 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Page Top Header */}
        <header className="border-b border-slate-200/80 pb-8 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-50/80 px-3 py-1 text-xs font-semibold text-cyan-700 backdrop-blur-xs dark:border-cyan-500/30 dark:bg-cyan-950/40 dark:text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" /> Recruiter Settings
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
            Recruiter Profile & Organization
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
            Keep your personal contact details accurate, manage verified company
            branding, and configure your account security.
          </p>
        </header>

        {/* Global Notice Toast */}
        {notice && (
          <div
            role="status"
            className={`mt-6 flex items-center justify-between rounded-2xl border p-4 text-sm font-medium shadow-sm transition ${
              notice.type === "success"
                ? "border-emerald-200/90 bg-emerald-50/90 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "border-red-200/90 bg-red-50/90 text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {notice.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
              )}
              <span>{notice.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="rounded-lg p-1 text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
              aria-label="Dismiss message"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* 2-Column Responsive Layout */}
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Left Sidebar: Identity & Navigation */}
          <aside className="space-y-6 lg:sticky lg:top-24">
            {/* Identity Card */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col items-center text-center">
                {user?.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={profile.fullName}
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded-2xl object-cover shadow-md ring-4 ring-cyan-500/15"
                  />
                ) : (
                  <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-600 to-cyan-700 text-xl font-bold text-white shadow-md ring-4 ring-cyan-500/15">
                    {recruiterInitials}
                  </span>
                )}

                <h2 className="mt-4 truncate text-lg font-bold text-slate-950 dark:text-white">
                  {profile.fullName || "Recruiter"}
                </h2>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {profile.title || "Talent Acquisition Specialist"}
                </p>
                <p className="mt-1 truncate text-xs text-slate-400 dark:text-slate-500">
                  {user?.email}
                </p>

                {/* Company & Role Tag */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
                  {company ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-50/60 px-3 py-1 text-xs font-semibold text-cyan-800 dark:border-cyan-500/30 dark:bg-cyan-950/40 dark:text-cyan-300">
                      <Building2 className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                      {company.name}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      Unaffiliated
                    </span>
                  )}
                  {profile.companyRole && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 uppercase dark:bg-slate-800 dark:text-slate-300">
                      {profile.companyRole}
                    </span>
                  )}
                </div>
              </div>

              {/* Workspace Completeness Meter */}
              <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Workspace Setup
                  </span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400">
                    {completeness}%
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    style={{ width: `${completeness}%` }}
                    className="h-full rounded-full bg-linear-to-r from-cyan-500 to-cyan-600 transition-all duration-500"
                  />
                </div>
                <p className="mt-2 text-[11px] leading-4 text-slate-400 dark:text-slate-500">
                  {completeness === 100
                    ? "Your recruiter & company profiles are fully completed."
                    : "Complete all fields and upload a company logo for verified credibility."}
                </p>
              </div>

              {/* Navigation Jump Links */}
              <nav
                className="mt-6 hidden space-y-1 border-t border-slate-100 pt-5 lg:block dark:border-slate-800"
                aria-label="Profile sections navigation"
              >
                <a
                  href="#personal"
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-cyan-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-cyan-400"
                >
                  <UserRound className="h-4 w-4" />
                  Personal Information
                </a>
                <a
                  href="#company"
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-cyan-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-cyan-400"
                >
                  <Building2 className="h-4 w-4" />
                  Company Details & Branding
                </a>
                <a
                  href="#account"
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-cyan-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-cyan-400"
                >
                  <Shield className="h-4 w-4" />
                  Security & Account
                </a>
              </nav>
            </div>
          </aside>

          {/* Right Column: Profile Sections */}
          <div className="min-w-0 space-y-8">
            {/* Section 1: Personal Information */}
            <section
              id="personal"
              className="scroll-mt-24 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300">
                    <UserRound className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                      Personal Information
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      Your identity as presented on job postings and candidate
                      correspondence.
                    </p>
                  </div>
                </div>

                {isProfileDirty && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                    Unsaved
                  </span>
                )}
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <FormField
                  label="Full Name"
                  value={profile.fullName}
                  onChange={(value) =>
                    setProfile({ ...profile, fullName: value })
                  }
                  placeholder="e.g. Sarah Jenkins"
                  icon={UserRound}
                  required
                />
                <FormField
                  label="Job Title"
                  value={profile.title ?? ""}
                  onChange={(value) => setProfile({ ...profile, title: value })}
                  placeholder="e.g. Lead Technical Recruiter"
                  icon={Briefcase}
                />
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={savingProfile || !isProfileDirty}
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-linear-to-r from-cyan-600 to-cyan-700 px-5 text-sm font-semibold text-white shadow-xs shadow-cyan-600/20 transition hover:from-cyan-500 hover:to-cyan-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingProfile ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Personal Info
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* Section 2: Company Details & Branding */}
            <section
              id="company"
              className="scroll-mt-24 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                      {company
                        ? "Company Details & Branding"
                        : "Create Your Organization"}
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {company
                        ? "Manage your company profile, industry classification, and verified logo."
                        : "Set up a company profile to unlock job postings and invite candidates."}
                    </p>
                  </div>
                </div>

                {!canEditCompany && company && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    View only (Member)
                  </span>
                )}
              </div>

              {/* Company Logo Widget (If Company Exists) */}
              {company && (
                <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800/80 dark:bg-slate-900/40">
                  <h3 className="text-xs font-semibold tracking-wider text-slate-900 uppercase dark:text-slate-200">
                    Company Logo
                  </h3>
                  <div className="mt-3.5 flex flex-wrap items-center gap-5">
                    {company.logoUrl ? (
                      <Image
                        src={company.logoUrl}
                        alt={`${company.name} logo`}
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-2xl object-cover shadow-sm ring-2 ring-slate-200 dark:ring-slate-700"
                      />
                    ) : (
                      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm ring-2 ring-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:ring-slate-700">
                        <Building2 className="h-8 w-8" />
                      </span>
                    )}

                    {canEditCompany && (
                      <div className="flex flex-col gap-1.5">
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void handleUploadLogo(file);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          disabled={uploadingLogo}
                          className="inline-flex min-h-9 w-fit items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-[0.99] disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                          {uploadingLogo ? (
                            <>
                              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Camera className="h-3.5 w-3.5" />
                              Change Company Logo
                            </>
                          )}
                        </button>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Recommended: 400x400px square JPEG, PNG, or WebP. Max
                          3MB.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Company Details Form */}
              <form onSubmit={handleSaveCompany} className="mt-6 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField
                    label="Company Name"
                    value={companyDraft.name}
                    onChange={(value) =>
                      setCompanyDraft({ ...companyDraft, name: value })
                    }
                    placeholder="e.g. Acme Technologies Inc."
                    icon={Building2}
                    disabled={Boolean(company) && !canEditCompany}
                    required
                  />
                  <FormField
                    label="Industry"
                    value={companyDraft.industry}
                    onChange={(value) =>
                      setCompanyDraft({ ...companyDraft, industry: value })
                    }
                    placeholder="e.g. Software, Financial Services"
                    icon={Briefcase}
                    disabled={Boolean(company) && !canEditCompany}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField
                    label="Website URL"
                    value={companyDraft.websiteUrl}
                    onChange={(value) =>
                      setCompanyDraft({ ...companyDraft, websiteUrl: value })
                    }
                    placeholder="https://acme.example.com"
                    icon={Globe}
                    type="url"
                    disabled={Boolean(company) && !canEditCompany}
                  />

                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Company Size
                    <div className="relative mt-1.5">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
                        <Users className="h-4 w-4" />
                      </span>
                      <select
                        value={companyDraft.size}
                        onChange={(e) =>
                          setCompanyDraft({
                            ...companyDraft,
                            size: e.target.value as Company["size"],
                          })
                        }
                        disabled={Boolean(company) && !canEditCompany}
                        className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pr-4 pl-10 text-sm text-slate-900 transition outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:disabled:bg-slate-800"
                      >
                        <option value="">Select company size</option>
                        {COMPANY_SIZE_OPTIONS.map((size) => (
                          <option key={size} value={size}>
                            {size} employees
                          </option>
                        ))}
                      </select>
                    </div>
                  </label>
                </div>

                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  About Company
                  <textarea
                    value={companyDraft.description}
                    onChange={(e) =>
                      setCompanyDraft({
                        ...companyDraft,
                        description: e.target.value,
                      })
                    }
                    disabled={Boolean(company) && !canEditCompany}
                    rows={4}
                    placeholder="Provide a summary of your mission, culture, and what makes your team a great place to work..."
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 transition outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:disabled:bg-slate-800"
                  />
                </label>

                {canEditCompany ? (
                  <div className="flex items-center justify-end pt-2">
                    <button
                      type="submit"
                      disabled={
                        savingCompany || (!isCompanyDirty && Boolean(company))
                      }
                      className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-linear-to-r from-cyan-600 to-cyan-700 px-5 text-sm font-semibold text-white shadow-xs shadow-cyan-600/20 transition hover:from-cyan-500 hover:to-cyan-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {savingCompany ? (
                        <>
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          {company
                            ? "Save Company Details"
                            : "Create Company Profile"}
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Only owners and admins can modify organization details.
                    Contact an administrator to update this information.
                  </p>
                )}
              </form>

              {/* Danger Zone: Leave Company */}
              {company && (
                <div className="mt-8 border-t border-red-100 pt-6 dark:border-red-950/60">
                  <div className="flex flex-col justify-between gap-4 rounded-2xl border border-red-200/80 bg-red-50/40 p-5 sm:flex-row sm:items-center dark:border-red-900/40 dark:bg-red-950/20">
                    <div>
                      <h4 className="text-sm font-semibold text-red-900 dark:text-red-200">
                        Leave Organization
                      </h4>
                      <p className="mt-0.5 text-xs text-red-700/80 dark:text-red-300/80">
                        Disassociate your recruiter account from {company.name}.
                      </p>
                    </div>

                    {!leaveConfirm && (
                      <button
                        type="button"
                        onClick={() => setLeaveConfirm(true)}
                        className="inline-flex min-h-9 w-fit items-center gap-1.5 rounded-xl border border-red-300 bg-white px-3.5 text-xs font-semibold text-red-700 shadow-xs transition hover:bg-red-50 dark:border-red-800 dark:bg-slate-900 dark:text-red-300 dark:hover:bg-red-950/40"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Leave Company
                      </button>
                    )}
                  </div>

                  {leaveConfirm && (
                    <div className="mt-4 rounded-2xl border border-red-300 bg-red-50 p-5 dark:border-red-800 dark:bg-red-950/40">
                      <p className="text-sm font-semibold text-red-900 dark:text-red-200">
                        Are you sure you want to leave {company.name}?
                      </p>
                      <p className="mt-1 text-xs leading-5 text-red-700 dark:text-red-300">
                        {profile.companyRole === "owner"
                          ? "As the sole owner, leaving will soft-delete this company unless another owner is designated. You will no longer manage this company's postings."
                          : "You will lose recruiter permissions for this company's open postings and candidate submissions."}
                      </p>

                      {leaveError && (
                        <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-100/80 p-3 text-xs font-medium text-red-800 dark:bg-red-900/50 dark:text-red-200">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                          <span>{leaveError}</span>
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2.5">
                        <button
                          type="button"
                          onClick={handleLeaveCompany}
                          disabled={leavingCompany}
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-red-700 px-4 text-xs font-semibold text-white shadow-xs transition hover:bg-red-800 disabled:opacity-50"
                        >
                          {leavingCompany ? (
                            <>
                              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                              Leaving...
                            </>
                          ) : (
                            "Confirm & Leave"
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLeaveConfirm(false);
                            setLeaveError(null);
                          }}
                          className="inline-flex min-h-9 items-center rounded-xl border border-slate-300 bg-white px-3.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Section 3: Security & Account */}
            <div id="account" className="scroll-mt-24">
              <AccountSettingsSection />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function FormField({
  label,
  value,
  onChange,
  disabled,
  placeholder,
  icon: Icon,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  icon?: typeof UserRound;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
      <span className="flex items-center justify-between">
        {label}
        {required && (
          <span className="text-[10px] text-cyan-600 dark:text-cyan-400">
            Required
          </span>
        )}
      </span>
      <div className="relative mt-1.5">
        {Icon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-xl border border-slate-300 bg-white py-2.5 pr-4 text-sm text-slate-900 transition outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:disabled:bg-slate-800 ${
            Icon ? "pl-10" : "pl-3.5"
          }`}
        />
      </div>
    </label>
  );
}
