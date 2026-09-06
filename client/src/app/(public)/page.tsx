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
} from "@/components/landing";

export default function Home() {
  return (
    <>
      <Hero />
      <CompanyMarquee />
      <TrustMetrics />
      <PopularSkills />
      <FeaturedJobs />
      <SalaryExplorer />
      <HowItWorks />
      <FeaturesBento />
      <Testimonials />
      <FaqSection />
      <CallToAction />
    </>
  );
}
