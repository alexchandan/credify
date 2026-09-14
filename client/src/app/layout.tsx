import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { TopProgressBar } from "@/components/ui/TopProgressBar";
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
      <body className="relative min-h-full bg-white text-slate-950 selection:bg-cyan-400/40 selection:text-slate-950 dark:bg-slate-950 dark:text-[#f1f8fa]">
        {/* Ambient Top Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed top-0 left-1/2 -z-10 h-125 w-200 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-100 transition-opacity duration-500 dark:opacity-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(6, 182, 212, 0.06) 0%, rgba(6, 182, 212, 0) 70%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none fixed top-0 left-1/2 -z-10 h-125 w-200 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity duration-500 dark:opacity-100"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(34, 211, 238, 0.13) 0%, rgba(34, 211, 238, 0) 70%)",
          }}
        />
        {/* Ambient Bottom Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed right-0 bottom-0 -z-10 h-150 w-150 rounded-full opacity-0 transition-opacity duration-500 dark:opacity-100"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(52, 211, 153, 0.06) 0%, rgba(52, 211, 153, 0) 70%)",
          }}
        />
        <TopProgressBar />
        <AuthProvider initialUser={initialUser}>{children}</AuthProvider>
      </body>
    </html>
  );
}
