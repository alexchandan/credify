"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/formErrors";

export function AccountSettingsSection() {
  return (
    <section
      id="account-settings"
      tabIndex={-1}
      className="mb-4 scroll-mt-24 rounded-lg border border-red-200 bg-white p-5 shadow-sm transition-all duration-300 outline-none target:border-rose-400 target:ring-2 target:ring-rose-500/50 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/50 dark:border-red-800 dark:bg-slate-900 dark:target:border-rose-500 dark:target:ring-rose-400/40 dark:focus:border-rose-500 dark:focus:ring-rose-400/40"
    >
      <div className="mb-4 flex items-center gap-2 border-b border-red-100 pb-3 dark:border-red-900">
        <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" />
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

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
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
        <input
          type={showPasswords ? "text" : "password"}
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          placeholder="Current password"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-orange-500 focus:outline-none dark:border-slate-700"
        />
        <div className="relative">
          <input
            type={showPasswords ? "text" : "password"}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="New password (8–15 characters)"
            required
            minLength={8}
            maxLength={15}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-10 text-sm focus:border-orange-500 focus:outline-none dark:border-slate-700"
          />
          <button
            type="button"
            onClick={() => setShowPasswords((visible) => !visible)}
            aria-label={showPasswords ? "Hide passwords" : "Show passwords"}
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
      router.replace("/login?deactivated=true");
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
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Deleting your account will immediately deactivate your profile and log
        you out. You will have a <strong>7 days</strong> to recover your
        account. After 7 days, your account, profile, and all associated data
        will be deleted permanently.
      </p>
      {!confirmOpen ? (
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="w-fit rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950/50"
        >
          Deactivate / Delete My Account
        </button>
      ) : (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/40">
          <div className="mb-2">
            <p className="text-sm font-semibold text-red-900 dark:text-red-200">
              Confirm Account Deletion
            </p>
            <p className="mt-1 text-xs text-red-700 dark:text-red-300">
              Enter your password to delete your account. You can log in within
              7 days to recover it. After 7 days, it will be permanently
              deleted.
            </p>
          </div>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your current password"
            className="mt-2 w-full rounded-lg border border-red-300 px-3 py-2.5 text-sm focus:outline-none dark:border-red-700 dark:bg-slate-900"
          />
          {error && (
            <p className="mt-2 text-sm text-red-700 dark:text-red-300">
              {error}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting || !password}
              className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-50"
            >
              {isSubmitting ? "Deleting..." : "Yes, delete my account"}
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmOpen(false);
                setPassword("");
                setError(null);
              }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-white dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
