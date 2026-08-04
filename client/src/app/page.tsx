import { Hero } from "@/components/landing/Hero";
import { Nav } from "@/components/Nav";
import { FeaturedJobs } from "@/components/landing/FeaturedJobs";
import { PopularSkills } from "@/components/landing/PopularSkills";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <PopularSkills />
      <FeaturedJobs />
      <div className="h-16" />
    </>
  );
}
