import type { SVGProps } from "react";

interface LogoProps extends SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
  withGlow?: boolean;
}

/**
 * Credify Logo
 * Simple, Modern & Professional
 * Combines the letter 'C' with a forward-leaning verification mark.
 */
export function Logo({
  size = 32,
  className = "",
  withGlow = false,
  ...props
}: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Credify Logo"
      {...props}
    >
      <defs>
        {/* Refined Brand Gradient: Cyan to Mint */}
        <linearGradient
          id="credify-brand-grad"
          x1="6"
          y1="6"
          x2="34"
          y2="34"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="60%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#38d996" />
        </linearGradient>

        {/* Secondary Accent Gradient for Verification Crest */}
        <linearGradient
          id="credify-accent-grad"
          x1="18"
          y1="14"
          x2="32"
          y2="28"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#38d996" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>

      {/* Subtle Glow (Optional) */}
      {withGlow && (
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="#22d3ee"
          opacity="0.18"
          filter="blur(8px)"
        />
      )}

      {/* Main Bold Geometric 'C' Curve */}
      <path
        d="M29.5 10.5C26.8 7.7 23.1 6 19 6C11.3 6 5 12.3 5 20C5 27.7 11.3 34 19 34C23.1 34 26.8 32.3 29.5 29.5"
        stroke="url(#credify-brand-grad)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      {/* Integrated Verification Tick / Upward Arrow Inside 'C' */}
      <path
        d="M15.5 20.5L19.5 24.5L30.5 13.5"
        stroke="url(#credify-accent-grad)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Trust Accent Node */}
      <circle cx="30.5" cy="13.5" r="2.25" fill="#38d996" />
      <circle cx="30.5" cy="13.5" r="1" fill="#f1f8fa" />
    </svg>
  );
}

export function LogoWithBrand({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Logo size={size} />
      <span className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white">
        Cre
        <span className="bg-linear-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent dark:from-[#22d3ee] dark:to-[#67e8f9]">
          di
        </span>
        fy
      </span>
    </div>
  );
}
