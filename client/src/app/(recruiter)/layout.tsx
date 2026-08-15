import { SiteChrome } from "@/components/SiteChrome";
import { RequireRole } from "@/components/auth/RequireRole";

export default function RecruiterLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SiteChrome>
      <RequireRole allowedRoles={["recruiter"]}>{children}</RequireRole>
    </SiteChrome>
  );
}
