import { RequireRole } from "@/components/RequireRole";

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireRole role="candidate">{children}</RequireRole>;
}
