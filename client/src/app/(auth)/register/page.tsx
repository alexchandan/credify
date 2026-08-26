"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage, parseFieldErrors } from "@/lib/formErrors";

type Role = "candidate" | "recruiter";

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, register } = useAuth();
  const [role, setRole] = useState<Role>(
    searchParams.get("role") === "recruiter" ? "recruiter" : "candidate",
  );
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(
        user.role === "candidate"
          ? "/candidate/dashboard"
          : user.role === "recruiter"
            ? "/recruiter/dashboard"
            : "/",
      );
      return;
    }
  }, [isLoading, router, user]);

  function clearFieldError(field: string) {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError(null);

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setIsSubmitting(true);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      await register({
        email: normalizedEmail,
        password,
        confirmPassword,
        fullName: fullName.trim(),
        role,
      });
      router.replace(
        `/check-email?email=${encodeURIComponent(normalizedEmail)}`,
      );
    } catch (err) {
      const fields = parseFieldErrors(err);
      if (Object.keys(fields).length > 0) setFieldErrors(fields);
      else setGeneralError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || user) {
    return null;
  }

  return (
    <AuthShell
      title="Create your account"
      description="Choose how you plan to use Credify, then add your details."
    >
      <div
        className="mt-7 grid grid-cols-2 rounded-lg border border-slate-200 p-1 text-sm font-semibold dark:border-slate-800"
        role="radiogroup"
        aria-label="Account type"
      >
        <button
          type="button"
          role="radio"
          aria-checked={role === "candidate"}
          onClick={() => setRole("candidate")}
          className={`rounded-md px-3 py-2.5 transition ${
            role === "candidate"
              ? "bg-orange-600 text-white"
              : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          Job seeker
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={role === "recruiter"}
          onClick={() => setRole("recruiter")}
          className={`rounded-md px-3 py-2.5 transition ${
            role === "recruiter"
              ? "bg-orange-600 text-white"
              : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          Employer
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        <div>
          <label
            htmlFor="register-name"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Full name
          </label>
          <input
            id="register-name"
            name="name"
            type="text"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              clearFieldError("fullName");
            }}
            placeholder="Enter your full name"
            autoComplete="name"
            maxLength={150}
            required
            autoFocus
            aria-invalid={Boolean(fieldErrors.fullName)}
            aria-describedby={
              fieldErrors.fullName ? "register-name-error" : undefined
            }
            className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-950 transition outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:text-white dark:focus:ring-orange-900/50"
          />
          {fieldErrors.fullName && (
            <p
              id="register-name-error"
              className="mt-1.5 text-xs text-red-700 dark:text-red-300"
            >
              {fieldErrors.fullName}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="register-email"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Email address
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearFieldError("email");
            }}
            placeholder="name@company.com"
            autoComplete="email"
            autoCapitalize="none"
            required
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={
              fieldErrors.email ? "register-email-error" : undefined
            }
            className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-950 transition outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:text-white dark:focus:ring-orange-900/50"
          />
          {fieldErrors.email && (
            <p
              id="register-email-error"
              className="mt-1.5 text-xs text-red-700 dark:text-red-300"
            >
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="register-password"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Password
          </label>
          <div className="relative mt-1.5">
            <input
              id="register-password"
              name="new-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                const nextPassword = e.target.value;
                setPassword(nextPassword);
                clearFieldError("password");
                if (confirmPassword) {
                  if (nextPassword === confirmPassword) {
                    clearFieldError("confirmPassword");
                  } else {
                    setFieldErrors((current) => ({
                      ...current,
                      confirmPassword: "Passwords do not match",
                    }));
                  }
                }
              }}
              placeholder="8-15 characters"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={15}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={
                fieldErrors.password
                  ? "register-password-help register-password-error"
                  : "register-password-help"
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-11 text-sm text-slate-950 transition outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:text-white dark:focus:ring-orange-900/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute top-1/2 right-1.5 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          <p
            id="register-password-help"
            className="mt-1.5 text-xs text-slate-500 dark:text-slate-400"
          >
            Use 8 to 15 characters.
          </p>
          {fieldErrors.password && (
            <p
              id="register-password-error"
              className="mt-1.5 text-xs text-red-700 dark:text-red-300"
            >
              {fieldErrors.password}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="register-confirm-password"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Confirm password
          </label>
          <div className="relative mt-1.5">
            <input
              id="register-confirm-password"
              name="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                const nextConfirmPassword = e.target.value;
                setConfirmPassword(nextConfirmPassword);
                if (nextConfirmPassword && nextConfirmPassword !== password) {
                  setFieldErrors((current) => ({
                    ...current,
                    confirmPassword: "Passwords do not match",
                  }));
                } else {
                  clearFieldError("confirmPassword");
                }
              }}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={15}
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
              aria-describedby={
                fieldErrors.confirmPassword
                  ? "register-confirm-password-error"
                  : undefined
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-11 text-sm text-slate-950 transition outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:text-white dark:focus:ring-orange-900/50"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((visible) => !visible)}
              aria-label={
                showConfirmPassword
                  ? "Hide confirmation password"
                  : "Show confirmation password"
              }
              aria-pressed={showConfirmPassword}
              className="absolute top-1/2 right-1.5 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <p
              id="register-confirm-password-error"
              className="mt-1.5 text-xs text-red-700 dark:text-red-300"
            >
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        {generalError && (
          <p
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
          >
            {generalError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-orange-700 hover:underline dark:text-orange-400"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterPageContent />
    </Suspense>
  );
}
