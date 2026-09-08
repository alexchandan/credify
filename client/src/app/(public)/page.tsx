"use client";

import { useAuth } from "@/context/AuthContext";
import {
  Hero,
  CompanyMarquee,
  TrustMetrics,
  PopularSkills,
  FeaturedJobs,
  SalaryExplorer,
  HowItWorks,
  FeaturesBento,
  Testimonials,
  FaqSection,
  CallToAction,
  LoggedInMemberHub,
} from "@/components/landing";

export default function Home() {
  const { user } = useAuth();

  return (
    <>
      <Hero />
      <CompanyMarquee />
      <TrustMetrics />
      <PopularSkills />
      <FeaturedJobs />
      <SalaryExplorer />
      {user ? (
        <LoggedInMemberHub user={user} />
      ) : (
        <>
          <HowItWorks />
          <FeaturesBento />
          <Testimonials />
          <FaqSection />
          <CallToAction />
        </>
      )}
    </>
  );
}
