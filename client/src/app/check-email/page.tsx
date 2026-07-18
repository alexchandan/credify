"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";

function webmailUrlFor(email: string): string {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  if (domain.includes("gmail")) return "https://mail.google.com/";
  if (
    domain.includes("outlook") ||
    domain.includes("hotmail") ||
    domain.includes("live")
  )
    return "https://outlook.live.com/mail/";
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
          ? "A new link has been sent."
          : (json.error?.message ?? "Something went wrong."),
      );
    } catch {
      setResendMessage("Could not reach the server. Please try again.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
        <Mail className="h-8 w-8 text-blue-700" strokeWidth={2} />
      </div>

      <h1 className="mt-6 text-2xl font-bold text-slate-900">
        Check your inbox
      </h1>
      <p className="mt-3 text-sm text-slate-500">
        A verification link has been sent to{" "}
        <span className="font-medium text-slate-700">
          {email || "your email address"}
        </span>
        . Please click the link in that email to confirm your account and get
        started with Credify.
      </p>

      <a
        href={email ? webmailUrlFor(email) : "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 block rounded-lg bg-slate-900 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        Open Email App
      </a>

      <button
        type="button"
        onClick={handleResend}
        disabled={isResending || !email}
        className="mt-3 w-full rounded-lg border border-slate-300 py-3 text-sm font-medium text-blue-700 transition hover:bg-slate-50 disabled:opacity-50"
      >
        {isResending ? "Sending..." : "Resend link"}
      </button>
      {resendMessage && (
        <p className="mt-2 text-xs text-slate-500">{resendMessage}</p>
      )}

      <div className="mt-6 border-t border-slate-100 pt-6 text-sm text-slate-500">
        Can&apos;t find the email? Check your spam folder.
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="text-lg font-bold text-slate-900">
            Credify
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Register
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-md flex-1 items-center px-6 py-12">
        <Suspense
          fallback={
            <p className="text-center text-sm text-slate-500">Loading...</p>
          }
        >
          <CheckEmailInner />
        </Suspense>
      </div>
    </div>
  );
}
