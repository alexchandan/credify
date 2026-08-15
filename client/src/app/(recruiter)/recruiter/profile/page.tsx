"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Building2, Camera, LogOut, Save, UserRound } from "lucide-react";
import { AccountSettingsSection } from "@/components/account/AccountSettingsSection";
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
  const [saving, setSaving] = useState(false);
  const [companySaving, setCompanySaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [leaveConfirm, setLeaveConfirm] = useState(false);
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

  const profileDirty =
    profile &&
    savedProfile &&
    (profile.fullName !== savedProfile.fullName ||
      profile.title !== savedProfile.title);

  useEffect(() => {
    if (!profileDirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [profileDirty]);

  async function saveProfile() {
    if (!profile) return;
    setSaving(true);
    setSuccessNotice(null);
    setErrorNotice(null);
    try {
      const result = await apiRequest<RecruiterProfile>("/recruiters/me", {
        method: "PATCH",
        body: {
          fullName: profile.fullName.trim(),
          title: profile.title?.trim(),
        },
      });
      setProfile(result.data);
      setSavedProfile(result.data);
      updateUser({ fullName: result.data.fullName });
      setSuccessNotice("Profile saved.");
    } catch (err) {
      setErrorNotice(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function saveCompany(event: React.FormEvent) {
    event.preventDefault();
    setCompanySaving(true);
    setSuccessNotice(null);
    setErrorNotice(null);
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
      setSuccessNotice(company ? "Company details saved." : "Company created.");
    } catch (err) {
      setErrorNotice(getErrorMessage(err));
    } finally {
      setCompanySaving(false);
    }
  }

  async function uploadLogo(file: File) {
    if (!company) return;
    setSuccessNotice(null);
    setErrorNotice(null);
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
      setSuccessNotice("Company logo updated.");
    } catch (err) {
      setErrorNotice(getErrorMessage(err));
    }
  }

  async function leaveCompany() {
    setLeaveError(null);
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
      setSuccessNotice("You have left the company.");
    } catch (err) {
      if (
        err instanceof ApiError &&
        err.code === "RECRUITER_OWNER_MUST_TRANSFER"
      ) {
        setLeaveError(
          "You are the owner while other recruiters remain. Transfer ownership before leaving.",
        );
      } else {
        setLeaveError(getErrorMessage(err));
      }
    }
  }

  if (loading) {
    return (
      <main className="flex-1 bg-slate-50 px-4 py-12 sm:px-6 dark:bg-slate-900">
        <div className="mx-auto max-w-3xl animate-pulse space-y-5">
          <div className="h-32 rounded-lg bg-white dark:bg-slate-950" />
          <div className="h-96 rounded-lg bg-white dark:bg-slate-950" />
        </div>
      </main>
    );
  }
  if (error || !profile) {
    return (
      <main className="flex-1 bg-slate-50 px-4 py-16 sm:px-6 dark:bg-slate-900">
        <p
          role="alert"
          className="mx-auto max-w-xl rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          {error ?? "Unable to load your profile."}
        </p>
      </main>
    );
  }

  const canEditCompany =
    profile.companyRole === "owner" || profile.companyRole === "admin";
  return (
    <main className="flex-1 bg-slate-50 px-4 py-8 sm:px-6 dark:bg-slate-900">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">
            Recruiter profile
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl dark:text-white">
            Your profile
          </h1>
        </header>
        <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center gap-4">
            {user?.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt=""
                width={64}
                height={64}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300">
                <UserRound className="h-7 w-7" />
              </span>
            )}
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-slate-950 dark:text-white">
                {profile.fullName}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {profile.title || "Recruiter"} · {user?.email}
              </p>
              <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 capitalize dark:bg-slate-800 dark:text-slate-300">
                {company?.name ?? "No company"} ·{" "}
                {profile.companyRole ?? "unaffiliated"}
              </span>
            </div>
          </div>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <h2 className="font-semibold text-slate-950 dark:text-white">
            Basic information
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              label="Full name"
              value={profile.fullName}
              onChange={(value) => setProfile({ ...profile, fullName: value })}
            />
            <Field
              label="Job title"
              value={profile.title ?? ""}
              onChange={(value) => setProfile({ ...profile, title: value })}
            />
          </div>
          <button
            type="button"
            onClick={saveProfile}
            disabled={saving || !profileDirty}
            className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save changes"}
          </button>
        </section>
        <section
          id="company"
          className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950"
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-orange-600" />
            <h2 className="font-semibold text-slate-950 dark:text-white">
              {company ? "Company details" : "Create your company"}
            </h2>
          </div>
          <form onSubmit={saveCompany} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Company name"
                value={companyDraft.name}
                onChange={(value) =>
                  setCompanyDraft({ ...companyDraft, name: value })
                }
                disabled={Boolean(company) && !canEditCompany}
                required
              />
              <Field
                label="Industry"
                value={companyDraft.industry}
                onChange={(value) =>
                  setCompanyDraft({ ...companyDraft, industry: value })
                }
                disabled={Boolean(company) && !canEditCompany}
              />
            </div>
            <Field
              label="Website URL"
              value={companyDraft.websiteUrl}
              onChange={(value) =>
                setCompanyDraft({ ...companyDraft, websiteUrl: value })
              }
              disabled={Boolean(company) && !canEditCompany}
              type="url"
            />
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Company size
              <select
                value={companyDraft.size}
                onChange={(event) =>
                  setCompanyDraft({
                    ...companyDraft,
                    size: event.target.value as Company["size"],
                  })
                }
                disabled={Boolean(company) && !canEditCompany}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2.5 text-sm dark:border-slate-700"
              >
                <option value="">Select size</option>
                {COMPANY_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Description
              <textarea
                value={companyDraft.description}
                onChange={(event) =>
                  setCompanyDraft({
                    ...companyDraft,
                    description: event.target.value,
                  })
                }
                disabled={Boolean(company) && !canEditCompany}
                rows={4}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2.5 text-sm dark:border-slate-700"
              />
            </label>
            {canEditCompany || !company ? (
              <button
                type="submit"
                disabled={companySaving}
                className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {companySaving
                  ? "Saving..."
                  : company
                    ? "Save company"
                    : "Create company"}
              </button>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Members can view company details but cannot edit them.
              </p>
            )}
          </form>
          {company && (
            <>
              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
                {company.logoUrl ? (
                  <Image
                    src={company.logoUrl}
                    alt={`${company.name} logo`}
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                ) : (
                  <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                    <Building2 className="h-6 w-6 text-slate-400" />
                  </span>
                )}
                {canEditCompany && (
                  <>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void uploadLogo(file);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold dark:border-slate-700"
                    >
                      <Camera className="h-4 w-4" />
                      Upload logo
                    </button>
                  </>
                )}
              </div>
              <div className="mt-5 border-t border-red-100 pt-5 dark:border-red-900">
                <button
                  type="button"
                  onClick={() => setLeaveConfirm(true)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-300"
                >
                  <LogOut className="h-4 w-4" />
                  Leave company
                </button>
                {leaveConfirm && (
                  <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
                    <p className="text-sm text-red-800 dark:text-red-300">
                      {profile.companyRole === "owner"
                        ? "As the sole owner, leaving will soft-delete this company. Are you sure?"
                        : "Are you sure you want to leave this company?"}
                    </p>
                    {leaveError && (
                      <p
                        role="alert"
                        className="mt-2 text-sm font-medium text-red-700 dark:text-red-300"
                      >
                        {leaveError}
                      </p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => void leaveCompany()}
                        className="rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white"
                      >
                        Confirm leave
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLeaveConfirm(false);
                          setLeaveError(null);
                        }}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
        {errorNotice && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
          >
            {errorNotice}
          </p>
        )}
        {successNotice && (
          <p
            role="status"
            className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
          >
            {successNotice}
          </p>
        )}
        <AccountSettingsSection />
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        required={required}
        className="mt-1.5 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2.5 text-sm disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-700 dark:disabled:bg-slate-900"
      />
    </label>
  );
}
