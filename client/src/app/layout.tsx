import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

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

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Credify | Find verified opportunities",
    template: "%s | Credify",
  },
  description:
    "Discover verified jobs, manage applications, and connect with growing companies on Credify.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
