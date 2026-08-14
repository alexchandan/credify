import { SiteChrome } from "@/components/SiteChrome";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <SiteChrome>{children}</SiteChrome>;
}
