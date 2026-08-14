import { Hero } from "@/components/landing/Hero";
import { FeaturedJobs } from "@/components/landing/FeaturedJobs";
import { PopularSkills } from "@/components/landing/PopularSkills";

export default function Home() {
  return (
    <>
      <Hero />
      <PopularSkills />
      <FeaturedJobs />
    </>
  );
}
