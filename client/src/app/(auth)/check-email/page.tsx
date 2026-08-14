"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Mail } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";

function webmailUrlFor(email: string): string {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  if (domain.includes("gmail")) return "https://mail.google.com/";
  if (
    domain.includes("outlook") ||
    domain.includes("hotmail") ||
    domain.includes("live")
  ) {
    return "https://outlook.live.com/mail/";
  }
  if (domain.includes("yahoo")) return "https://mail.yahoo.com/";
  return `mailto:${email}`;
}

function CheckEmailInner() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  async function handleResend() {
    if (!email) return;
    setIsResending(true);
    setResendMessage(null);

    try {
      const res = await fetch(`${API_BASE}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      setResendMessage(
        json.success
          ? "A new verification link has been sent."
          : (json.error?.message ?? "Something went wrong."),
      );
    } catch {
      setResendMessage("Could not reach the server. Please try again.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <AuthShell
      title="Check your inbox"
      description="Use the verification link we sent to confirm your account."
    >
      <div className="mt-7 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-700">
          <Mail className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Sent to{" "}
          <span className="font-semibold text-slate-800">
            {email || "your email address"}
          </span>
        </p>

        {email ? (
          <a
            href={webmailUrlFor(email)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
          >
            Open email app
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        ) : (
          <p className="mt-5 rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-800">
            No email address was provided. Register again to request a new link.
          </p>
        )}

        <button
          type="button"
          onClick={handleResend}
          disabled={isResending || !email}
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-orange-300 px-4 py-2.5 text-sm font-semibold text-orange-700 transition hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isResending ? "Sending..." : "Resend verification link"}
        </button>
        {resendMessage && (
          <p className="mt-3 text-sm text-slate-600" aria-live="polite">
            {resendMessage}
          </p>
        )}

        <Link
          href="/login"
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-700 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to sign in
        </Link>
        <p className="mt-6 border-t border-slate-100 pt-5 text-xs text-slate-500">
          Can&apos;t find the email? Check your spam folder.
        </p>
      </div>
    </AuthShell>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense
      fallback={
        <AuthShell
          title="Loading your email details"
          description="This will only take a moment."
        >
          <p className="mt-7 text-center text-sm text-slate-500" role="status">
            Loading...
          </p>
        </AuthShell>
      }
    >
      <CheckEmailInner />
    </Suspense>
  );
}
