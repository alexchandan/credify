"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const activeRef = useRef(false);
  const trickleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const completeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);
  const safetyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastUrlRef = useRef<string>("");

  const clearAllTimers = useCallback(() => {
    if (trickleTimerRef.current) clearInterval(trickleTimerRef.current);
    if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    trickleTimerRef.current = null;
    completeTimerRef.current = null;
    resetTimerRef.current = null;
    safetyTimerRef.current = null;
  }, []);

  const completeProgress = useCallback(() => {
    clearAllTimers();
    activeRef.current = false;

    // Immediately snap to 100%
    setProgress(100);

    // Hold at 100% briefly so user sees the completed state, then fade out
    completeTimerRef.current = setTimeout(() => {
      setIsVisible(false);

      // Once faded out, reset progress to 0 for next navigation
      resetTimerRef.current = setTimeout(() => {
        setProgress(0);
      }, 250);
    }, 200);
  }, [clearAllTimers]);

  const startProgress = useCallback(() => {
    clearAllTimers();
    activeRef.current = true;
    setIsVisible(true);
    setProgress(28);

    // Smoothly trickle up to ~92% while waiting for page
    trickleTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev;
        const step = prev < 60 ? 12 : prev < 80 ? 5 : 2;
        return Math.min(prev + step, 92);
      });
    }, 180);

    // Safety timeout: auto-complete if navigation stalls or takes >6s
    safetyTimerRef.current = setTimeout(() => {
      if (activeRef.current) {
        completeProgress();
      }
    }, 6000);
  }, [clearAllTimers, completeProgress]);

  // Complete progress on route change and record current URL
  useEffect(() => {
    lastUrlRef.current =
      typeof window !== "undefined"
        ? window.location.pathname + window.location.search
        : "";
    if (activeRef.current) {
      completeProgress();
    }
  }, [pathname, searchParams, completeProgress]);

  // Clean up on unmount
  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  // Intercept click on internal links and browser back/forward
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      // Don't intercept modified clicks (open in new tab, etc.)
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Ignore external protocols, downloads, new tabs, and any hash / in-page redirection
      if (
        href.includes("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      ) {
        return;
      }

      try {
        const targetUrl = new URL(href, window.location.href);

        // Ignore different origins
        if (targetUrl.origin !== window.location.origin) return;

        // Ignore hash fragments / in-page anchors
        if (targetUrl.hash) return;

        // Normalize paths (strip trailing slashes)
        const currentPath = window.location.pathname.replace(/\/$/, "") || "/";
        const targetPath = targetUrl.pathname.replace(/\/$/, "") || "/";

        // Ignore same URL clicks
        const isSamePath = targetPath === currentPath;
        const isSameSearch = targetUrl.search === window.location.search;
        if (isSamePath && isSameSearch) return;

        startProgress();
      } catch {
        // Invalid URL, ignore
      }
    }

    function handlePopState() {
      // Ignore in-page hash redirection
      if (window.location.hash) return;

      const currentUrl = window.location.pathname + window.location.search;
      if (currentUrl === lastUrlRef.current) return;

      startProgress();
    }

    function handleHashChange() {
      // If a hash change occurs while progress is running, dismiss it immediately
      if (activeRef.current) {
        completeProgress();
      }
    }

    document.addEventListener("click", handleClick, { capture: true });
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [startProgress, completeProgress]);

  if (!isVisible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 right-0 left-0 z-9999 h-[2.5px] overflow-hidden bg-transparent"
    >
      <div
        className="h-full bg-linear-to-r from-cyan-500 via-cyan-400 to-emerald-400 shadow-[0_0_12px_rgba(6,182,212,0.9),0_0_6px_rgba(52,211,153,0.8)] transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: isVisible ? 1 : 0,
        }}
      />
    </div>
  );
}

export function TopProgressBar() {
  return (
    <Suspense fallback={null}>
      <ProgressBar />
    </Suspense>
  );
}
