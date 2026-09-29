"use client";

import { useEffect, useState } from "react";
import { useAuth, type AuthUser } from "@/context/AuthContext";
import { apiRequest } from "@/lib/apiClient";
import type { PublicLandingSummary } from "@/types/landing";
import { CompanyMarquee } from "./CompanyMarquee";
import { EngineeringClusters } from "./EngineeringClusters";
import { FeaturedJobs } from "./FeaturedJobs";
import { Hero } from "./Hero";
import { LoggedInMemberHub } from "./LoggedInMemberHub";
import { TrustMetrics } from "./TrustMetrics";
import { TwoPathways } from "./TwoPathways";

interface LandingViewProps {
  initialUser: AuthUser | null;
}

export function LandingView({ initialUser }: LandingViewProps) {
  const { user: clientUser } = useAuth();
  const effectiveUser = clientUser || initialUser;
  const [summary, setSummary] = useState<PublicLandingSummary | null>(null);
  const [summaryLoadComplete, setSummaryLoadComplete] = useState(false);
  const isSummaryLoading = !effectiveUser && !summaryLoadComplete;

  useEffect(() => {
    if (effectiveUser) return;

    const controller = new AbortController();
    apiRequest<PublicLandingSummary>("/dashboard/public", {
      skipAuth: true,
      signal: controller.signal,
    })
      .then((result) => {
        if (!controller.signal.aborted) setSummary(result.data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setSummary(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setSummaryLoadComplete(true);
      });

    return () => controller.abort();
  }, [effectiveUser]);

  if (effectiveUser) {
    return <LoggedInMemberHub user={effectiveUser} />;
  }

  return (
    <div className="relative">
      <Hero />
      <CompanyMarquee
        companies={summary?.hiringCompanies ?? []}
        isLoading={isSummaryLoading}
      />
      <TrustMetrics
        metrics={summary?.metrics ?? null}
        isLoading={isSummaryLoading}
      />
      <FeaturedJobs
        jobs={summary?.featuredJobs ?? []}
        isLoading={isSummaryLoading}
      />
      <TwoPathways />
      <EngineeringClusters
        skills={summary?.topSkills ?? []}
        isLoading={isSummaryLoading}
      />
    </div>
  );
}
