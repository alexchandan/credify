import { cookies } from "next/headers";
import {
  AUTH_USER_SNAPSHOT_COOKIE,
  decodeAuthUserSnapshot,
} from "@/lib/authUserSnapshot";
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

export default async function Home() {
  const cookieStore = await cookies();
  const user = decodeAuthUserSnapshot(
    cookieStore.get(AUTH_USER_SNAPSHOT_COOKIE)?.value,
  );

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
