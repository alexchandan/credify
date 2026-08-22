import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import {
  AUTH_USER_SNAPSHOT_COOKIE,
  decodeAuthUserSnapshot,
} from "@/lib/authUserSnapshot";

const themeScript = [
  "(() => {",
  "try {",
  'const storedTheme = localStorage.getItem("credify-theme");',
  "const isDark = storedTheme",
  '  ? storedTheme === "dark"',
  '  : window.matchMedia("(prefers-color-scheme: dark)").matches;',
  'document.documentElement.classList.toggle("dark", isDark);',
  'document.documentElement.style.colorScheme = isDark ? "dark" : "light";',
  "} catch {}",
  "})();",
].join("");

export const metadata: Metadata = {
  title: {
    default: "Credify | Find verified opportunities",
    template: "%s | Credify",
  },
  description:
    "Discover verified jobs, manage applications, and connect with growing companies on Credify.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialUser = decodeAuthUserSnapshot(
    cookieStore.get(AUTH_USER_SNAPSHOT_COOKIE)?.value,
  );

  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
        <AuthProvider initialUser={initialUser}>{children}</AuthProvider>
      </body>
    </html>
  );
}
