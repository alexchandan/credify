import { RequireRole } from "@/components/RequireRole";

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireRole role="recruiter">{children}</RequireRole>;
}
