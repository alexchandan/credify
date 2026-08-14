import { SiteChrome } from "@/components/SiteChrome";
import { RequireRole } from "@/components/auth/RequireRole";

export default function CandidateLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SiteChrome>
      <RequireRole allowedRoles={["candidate"]}>{children}</RequireRole>
    </SiteChrome>
  );
}
