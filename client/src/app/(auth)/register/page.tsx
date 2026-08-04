"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { parseFieldErrors, getErrorMessage } from "@/lib/formErrors";

type Role = "candidate" | "recruiter";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [role, setRole] = useState<Role>("candidate");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError(null);
    setIsSubmitting(true);

    try {
      // Uses the real AuthContext now, same as Login.
      await register({ email, password, fullName, role });
      // Navigate for real, instead of rendering <CheckEmailPage /> inline —
      // that page reads the email via useSearchParams(), which only works
      // when the URL actually changes, not when the component is just
      // rendered in place without navigation.
      router.push(`/check-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      const fields = parseFieldErrors(err);
      if (Object.keys(fields).length > 0) {
        setFieldErrors(fields);
      } else {
        setGeneralError(getErrorMessage(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 items-center px-6 py-12">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-bold text-slate-900">
          Join Credify
        </h1>
        <p className="mt-1 text-center text-sm text-slate-500">
          Accelerate your professional journey today.
        </p>

        <div className="mt-6 grid grid-cols-2 rounded-lg border border-slate-200 p-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => setRole("candidate")}
            className={`rounded-md py-2 transition ${role === "candidate" ? "bg-slate-900 text-white" : "text-slate-500"} cursor-pointer`}
          >
            Job Seeker
          </button>
          <button
            type="button"
            onClick={() => setRole("recruiter")}
            className={`rounded-md py-2 transition ${role === "recruiter" ? "bg-slate-900 text-white" : "text-slate-500"} cursor-pointer`}
          >
            Employer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
            />
            {fieldErrors.fullName && (
              <p className="mt-1 text-xs text-red-600">
                {fieldErrors.fullName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6-15 characters"
                required
                minLength={6}
                maxLength={15}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-10 text-sm focus:border-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-600">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {generalError && (
            <p className="text-sm text-red-600">{generalError}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 cursor-pointer rounded-lg bg-slate-900 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-700 hover:underline"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
