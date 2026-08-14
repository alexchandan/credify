"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError(
        "No reset token was found. Use the password reset link from your email.",
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(API_BASE + "/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(
          json.error?.message ?? "Something went wrong. Please try again.",
        );
        return;
      }
      setSuccess(true);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <AuthShell
        title="Password reset"
        description="Your new password is ready. You can now sign in."
      >
        <div className="mt-7 text-center" role="status">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <Link
            href="/login"
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
          >
            Go to sign in
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create a new password"
      description="Choose a secure password you have not used for this account."
    >
      <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
        <PasswordField
          id="reset-new-password"
          label="New password"
          value={newPassword}
          showPassword={showNewPassword}
          onChange={setNewPassword}
          onToggle={() => setShowNewPassword((visible) => !visible)}
          describedBy="reset-password-help"
          autoFocus
        />
        <p id="reset-password-help" className="-mt-3 text-xs text-slate-500">
          Use 8 to 15 characters.
        </p>

        <PasswordField
          id="reset-confirm-password"
          label="Confirm password"
          value={confirmPassword}
          showPassword={showConfirmPassword}
          onChange={setConfirmPassword}
          onToggle={() => setShowConfirmPassword((visible) => !visible)}
        />

        {error && (
          <p
            id="reset-password-error"
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Resetting..." : "Reset password"}
        </button>
      </form>

      <Link
        href="/login"
        className="mt-6 flex items-center justify-center gap-1.5 text-sm font-semibold text-orange-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to sign in
      </Link>
    </AuthShell>
  );
}

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  showPassword: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
  describedBy?: string;
  autoFocus?: boolean;
}

function PasswordField({
  id,
  label,
  value,
  showPassword,
  onChange,
  onToggle,
  describedBy,
  autoFocus = false,
}: PasswordFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative mt-1.5">
        <input
          id={id}
          name={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={15}
          autoFocus={autoFocus}
          aria-describedby={describedBy}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-11 text-sm text-slate-950 transition outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={`${showPassword ? "Hide" : "Show"} ${label.toLowerCase()}`}
          aria-pressed={showPassword}
          className="absolute top-1/2 right-1.5 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthShell
          title="Loading password reset"
          description="This will only take a moment."
        >
          <p className="mt-7 text-center text-sm text-slate-500" role="status">
            Loading...
          </p>
        </AuthShell>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}
