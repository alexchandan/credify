import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account",
};

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="flex min-h-screen flex-col bg-slate-50">{children}</main>
  );
}
