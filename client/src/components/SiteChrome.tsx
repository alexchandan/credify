import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Header";

export function SiteChrome({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950">
      <Nav />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </div>
  );
}
