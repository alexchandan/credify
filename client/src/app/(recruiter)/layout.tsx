import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SiteChrome } from "@/components/SiteChrome";
import { RequireRole } from "@/components/auth/RequireRole";
import {
  AUTH_USER_SNAPSHOT_COOKIE,
  decodeAuthUserSnapshot,
} from "@/lib/authUserSnapshot";

export default async function RecruiterLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const user = decodeAuthUserSnapshot(
    cookieStore.get(AUTH_USER_SNAPSHOT_COOKIE)?.value,
  );

  if (!user) {
    redirect("/login?next=/recruiter/dashboard");
  }

  if (user.role !== "recruiter") {
    redirect("/unauthorized");
  }

  return (
    <SiteChrome>
      <RequireRole allowedRoles={["recruiter"]}>{children}</RequireRole>
    </SiteChrome>
  );
}
