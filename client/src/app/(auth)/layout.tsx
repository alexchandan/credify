import { RequireGuest } from "@/components/RequireGuest";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireGuest>{children}</RequireGuest>;
}
