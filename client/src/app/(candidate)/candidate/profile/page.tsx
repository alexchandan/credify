"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
} from "lucide-react";
import { apiRequest, ApiError } from "@/lib/apiClient";
import { getErrorMessage } from "@/lib/formErrors";
import { useAuth, type AuthUser } from "@/context/AuthContext";
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

export default function CandidateProfilePage() {
  const { user } = useAuth();

  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  useEffect(() => {
    // No manual auth/role check needed here — this page lives under the
    // (candidate) route group, whose layout.tsx wraps it in RequireRole.
    // By the time this component ever renders, a logged-in candidate is
    // already guaranteed.
    apiRequest<CandidateProfile>("/candidates/me")
      .then((result) => setProfile(result.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleSave() {
    if (!profile) return;
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const result = await apiRequest<CandidateProfile>("/candidates/me", {
        method: "PATCH",
        body: {
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
        },
      });
      setProfile(result.data);
      setSaveMessage("Profile saved.");
    } catch (err) {
      setSaveMessage(getErrorMessage(err));
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 4000);
    }
  }

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingResume(true);
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
      setProfile(result.data);
    } catch (err) {
      if (err instanceof ApiError && err.code === "INVALID_FILE_TYPE") {
        setSaveMessage("Only PDF files are allowed.");
      } else {
        setSaveMessage(getErrorMessage(err));
      }
    } finally {
      setIsUploadingResume(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-slate-500">
        Loading your profile...
      </div>
    );
  }
  if (error || !profile) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-red-600">
        {error ?? "Profile not found."}
      </div>
    );
  }

  const strength = calculateProfileStrength(profile);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-8 pb-32">
        <h1 className="text-sm font-medium text-slate-500">Edit Profile</h1>
        <p className="mt-1 text-2xl font-semibold text-slate-900">
          Update your professional profile
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Keep your skills, resume, and experience current so recruiters see an
          accurate picture of you.
        </p>

        {/* --- Profile Strength --- */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-blue-700">
              {strengthLabel(strength)}
            </span>
            <span className="font-semibold text-slate-900">{strength}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-700 transition-all"
              style={{ width: `${strength}%` }}
            />
          </div>
          {strength < 100 && (
            <p className="mt-2 text-xs text-slate-400">
              {!profile.headline && "Add a headline. "}
              {profile.skills.length === 0 && "Add your skills. "}
              {!profile.location && "Add your location. "}
              {!profile.resumeUrl && "Upload a resume. "}
              {profile.education.length === 0 && "Add your education. "}
              {profile.experience.length === 0 && "Add your work experience. "}
            </p>
          )}
        </section>

        {/* --- General Info --- */}
        <Card icon={UserIcon} title="General Info">
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
              <label className="block text-xs font-medium tracking-wide text-slate-500 uppercase">
                Availability
              </label>
              <select
                value={profile.availability}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    availability: e.target.value as Availability,
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
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
            <label className="block text-xs font-medium tracking-wide text-slate-500 uppercase">
              Email
            </label>
            <input
              type="email"
              value={user?.email ?? ""}
              disabled
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500"
            />
            <p className="mt-1 text-xs text-slate-400">
              Your email is tied to your account and can&apos;t be changed here.
            </p>
          </div>
        </Card>

        {/* --- Skills --- */}
        <Card icon={Sparkles} title="Skills">
          <SkillsEditor
            skills={profile.skills}
            onChange={(skills) => setProfile({ ...profile, skills })}
          />
        </Card>

        {/* --- Resume --- */}
        <Card icon={FileText} title="Resume">
          {profile.resumeUrl ? (
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
              <div>
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-slate-900 hover:underline"
                >
                  Current resume
                </a>
                <p className="text-xs text-slate-400">
                  {profile.resumeUploadedAt
                    ? `Uploaded on ${new Date(profile.resumeUploadedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}`
                    : "Upload date unavailable"}
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  View Current
                </a>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingResume}
                  className="rounded-full bg-blue-700 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-800 disabled:opacity-50"
                >
                  {isUploadingResume ? "Uploading..." : "Replace File"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-dashed border-slate-300 p-4">
              <p className="text-sm text-slate-500">
                No resume uploaded yet — required before you can apply to jobs.
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingResume}
                className="rounded-full bg-blue-700 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-800 disabled:opacity-50"
              >
                {isUploadingResume ? "Uploading..." : "Upload Resume"}
              </button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleResumeUpload}
            className="hidden"
          />
        </Card>

        {/* --- Detailed History --- */}
        <Card icon={History} title="Detailed History">
          <div className="flex flex-col gap-3">
            <ListEditor<Education>
              title="Education"
              icon={GraduationCap}
              items={profile.education}
              onChange={(education) => setProfile({ ...profile, education })}
              emptyItem={{ institution: "", degree: "", startDate: "" }}
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
              onChange={(experience) => setProfile({ ...profile, experience })}
              emptyItem={{
                company: "",
                title: "",
                startDate: "",
                isCurrent: false,
              }}
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
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={item.isCurrent}
                      onChange={(e) => update({ isCurrent: e.target.checked })}
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
                  <TextField
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
              renderSummary={(p) => p.title || "New project"}
              renderFields={(item, update) => (
                <>
                  <TextField
                    label="Title"
                    value={item.title}
                    onChange={(v) => update({ title: v })}
                  />
                  <TextField
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
                    label="Link"
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
                </>
              )}
            />
          </div>
        </Card>

        {/* --- Professional Links --- */}
        <Card icon={Link2} title="Professional Links">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="LinkedIn"
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

      {/* --- Sticky Save Bar --- */}
      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/90 px-6 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-end gap-3">
          {saveMessage && (
            <span className="text-sm text-slate-500">{saveMessage}</span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Profile"}
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
  icon: Icon,
  title,
  children,
}: {
  icon: typeof UserIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
        <Icon className="h-4 w-4 text-blue-700" strokeWidth={2} />
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium tracking-wide text-slate-500 uppercase">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
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
  return (
    <div>
      <label className="block text-xs font-medium tracking-wide text-slate-500 uppercase">
        {label}
      </label>
      <input
        type="date"
        value={value ? value.slice(0, 10) : ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
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
    const trimmed = input.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed]);
    }
    setInput("");
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
        {skills.map((skill) => (
          <span
            key={skill}
            className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
          >
            {skill}
            <button
              type="button"
              onClick={() => onChange(skills.filter((s) => s !== skill))}
              className="text-blue-400 hover:text-blue-700"
            >
              ×
            </button>
          </span>
        ))}
        {skills.length === 0 && (
          <span className="text-sm text-slate-400">No skills added yet.</span>
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
          className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={addSkill}
          className="rounded-full bg-blue-50 px-4 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100"
        >
          + Add
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
  renderSummary,
  renderFields,
}: {
  title: string;
  icon: typeof GraduationCap;
  items: T[];
  onChange: (items: T[]) => void;
  emptyItem: T;
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
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between bg-slate-50 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 font-medium text-slate-900">
          <Icon className="h-4 w-4 text-blue-700" />
          {title}
          <span className="text-xs font-normal text-slate-400">
            ({items.length})
          </span>
        </span>
        <span className="text-slate-400">{isOpen ? "−" : "+"}</span>
      </button>

      {isOpen && (
        <div className="flex flex-col gap-3 p-4">
          {items.map((item, index) => (
            <details
              key={index}
              className="rounded-lg border border-slate-200 p-3"
            >
              <summary className="flex cursor-pointer items-center justify-between text-sm text-slate-700">
                {renderSummary(item)}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    removeExisting(index);
                  }}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              </summary>
              <div className="mt-3 flex flex-col gap-2">
                {renderFields(item, (patch) => updateExisting(index, patch))}
              </div>
            </details>
          ))}

          {isAdding ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-3">
              <div className="flex flex-col gap-2">
                {renderFields(draft, (patch) =>
                  setDraft({ ...draft, ...patch }),
                )}
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={addDraft}
                  className="rounded-full bg-blue-700 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setDraft(emptyItem);
                  }}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-xs text-slate-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="text-left text-sm text-blue-700 hover:underline"
            >
              + Add {title.toLowerCase()}
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
      className="mt-4 scroll-mt-20 rounded-2xl border border-red-200 bg-white p-5"
    >
      <div className="mb-4 flex items-center gap-2 border-b border-red-100 pb-3">
        <ShieldAlert className="h-4 w-4 text-red-600" strokeWidth={2} />
        <h2 className="text-base font-semibold text-slate-900">
          Account Settings
        </h2>
      </div>
      <div className="flex flex-col gap-6">
        <ChangePasswordForm />
        <div className="border-t border-slate-100 pt-6">
          <DeleteAccountForm />
        </div>
      </div>
    </section>
  );
}

function ChangePasswordForm() {
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
      const result = await apiRequest<{ accessToken: string; user: AuthUser }>(
        "/auth/change-password",
        {
          method: "POST",
          body: { currentPassword, newPassword },
        },
      );
      // Keeps THIS session logged in with the fresh token, while every
      // other session was just invalidated server-side.
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
      <h3 className="text-sm font-medium text-slate-900">Change Password</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="relative">
          <input
            type={showPasswords ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-10 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="relative">
          <input
            type={showPasswords ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password (6–15 characters)"
            required
            minLength={6}
            maxLength={15}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-10 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPasswords((v) => !v)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400"
          >
            {showPasswords ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && (
        <p className="text-sm text-emerald-600">
          Password changed. You&apos;ve been logged out of all other sessions.
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-fit rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        {isSubmitting ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}

function DeleteAccountForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleDelete() {
    setError(null);
    setIsSubmitting(true);
    try {
      await apiRequest("/auth/delete-account", {
        method: "DELETE",
        body: { password },
      });
      router.push("/");
    } catch (err) {
      setError(getErrorMessage(err));
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-red-700">Delete Account</h3>
      <p className="text-sm text-slate-500">
        This permanently deactivates your account and profile. This cannot be
        undone from within the app.
      </p>

      {!confirmOpen ? (
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="w-fit rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
        >
          Delete My Account
        </button>
      ) : (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">
            Enter your password to confirm. This is permanent.
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            className="mt-2 w-full rounded-lg border border-red-300 px-3 py-2.5 text-sm focus:outline-none"
          />
          {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
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
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
