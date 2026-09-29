"use client";

import { useState, useSyncExternalStore } from "react";
import { useAuth, type AuthUser } from "@/context/AuthContext";
import {
  Hero,
  CompanyMarquee,
  TrustMetrics,
  TwoPathways,
  EngineeringClusters,
  Testimonials,
  LoggedInMemberHub,
} from "@/components/landing";
import { Sparkles } from "lucide-react";

interface LandingViewProps {
  initialUser: AuthUser | null;
}

const DEFAULT_DEMO_USER: AuthUser = {
  id: "alex-rivera-verified",
  email: "alex.rivera@engineering.io",
  fullName: "Alex Rivera",
  role: "candidate",
  isVerified: true,
};

function subscribeToLocation(callback: () => void) {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

function getLocationPreviewSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return (
    params.get("preview") === "loggedin" ||
    params.get("preview") === "candidate"
  );
}

function getServerSnapshot(): boolean {
  return false;
}

export function LandingView({ initialUser }: LandingViewProps) {
  const { user: clientUser } = useAuth();
  const effectiveUser = clientUser || initialUser;

  const queryPreviewMode = useSyncExternalStore(
    subscribeToLocation,
    getLocationPreviewSnapshot,
    getServerSnapshot,
  );
  const [manualPreview, setManualPreview] = useState<boolean | null>(null);
  const previewMode = manualPreview ?? queryPreviewMode;
  const setPreviewMode = setManualPreview;

  const showLoggedInExperience = Boolean(effectiveUser || previewMode);
  const activeUser = effectiveUser || DEFAULT_DEMO_USER;

  if (showLoggedInExperience) {
    return (
      <div className="relative">
        {/* If in guest preview mode, show a discreet preview banner */}
        {!effectiveUser && previewMode && (
          <aside
            aria-label="Preview notification"
            className="sticky top-16 z-30 flex items-center justify-between border-b border-blue-200 bg-blue-50/95 px-4 py-2 text-xs text-blue-900 backdrop-blur-md dark:border-blue-900/40 dark:bg-blue-950/80 dark:text-blue-200"
          >
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 animate-pulse rounded-full bg-blue-600" />
                <span className="font-semibold">
                  Preview Mode: Showing Logged-in Candidate Experience (Alex
                  Rivera · Verified Staff Engineer)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewMode(false)}
                className="rounded-md border border-blue-300 bg-white px-2.5 py-1 font-semibold text-blue-800 transition hover:bg-blue-50 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-100"
              >
                Switch to Guest Landing Page
              </button>
            </div>
          </aside>
        )}

        <LoggedInMemberHub user={activeUser} />
      </div>
    );
  }

  return (
    <div className="relative">
      <Hero />
      <CompanyMarquee />
      <TrustMetrics />
      <TwoPathways />
      <EngineeringClusters />
      <Testimonials />

      {/* Floating Preview Switcher for guests/developers to test the logged-in landing page */}
      <aside
        aria-label="Developer controls"
        className="fixed right-6 bottom-6 z-40"
      >
        <button
          type="button"
          onClick={() => setPreviewMode(true)}
          className="group flex items-center gap-2 rounded-full border border-slate-900/10 bg-slate-950 px-4 py-2.5 text-xs font-bold text-white shadow-xl transition-all hover:bg-slate-800 hover:shadow-2xl active:scale-95 dark:border-white/20 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
        >
          <Sparkles className="h-4 w-4 text-cyan-400 dark:text-cyan-600" />
          <span>Preview Logged-in Landing Page</span>
          <span className="rounded-full bg-cyan-500/20 px-1.5 py-0.5 text-[10px] text-cyan-300 dark:bg-cyan-500/30 dark:text-cyan-800">
            Alex Rivera
          </span>
        </button>
      </aside>
    </div>
  );
}
