---
name: Credify Modern Professional
colors:
  # Surface & Background Architecture
  background: "#ffffff"
  on-background: "#061722"
  surface: "#f8fafc"
  surface-dim: "#d7e7ed"
  surface-bright: "#ffffff"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f8fafc"
  surface-container: "#eef5f8"
  surface-container-high: "#d7e7ed"
  surface-container-highest: "#b4ccd5"
  surface-variant: "#eef5f8"
  on-surface: "#061722"
  on-surface-variant: "#496a77"
  inverse-surface: "#061722"
  inverse-on-surface: "#f1f8fa"

  # Primary Brand Palette (Cyan / Deep Teal)
  primary: "#0891b2"
  on-primary: "#ffffff"
  primary-container: "#ecfeff"
  on-primary-container: "#164e63"
  inverse-primary: "#22d3ee"
  primary-fixed: "#cffafe"
  primary-fixed-dim: "#a5f3fc"
  on-primary-fixed: "#082f49"
  on-primary-fixed-variant: "#155e75"

  # Secondary Brand Palette (Electric Teal / Blue)
  secondary: "#06b6d4"
  on-secondary: "#ffffff"
  secondary-container: "#cffafe"
  on-secondary-container: "#155e75"
  secondary-fixed: "#cffafe"
  secondary-fixed-dim: "#67e8f9"
  on-secondary-fixed: "#082f49"
  on-secondary-fixed-variant: "#0e7490"

  # Tertiary / Accent Palette (Mint & Growth)
  tertiary: "#38d996"
  on-tertiary: "#061722"
  tertiary-container: "#ecfdf5"
  on-tertiary-container: "#065f46"
  tertiary-fixed: "#a7f3d0"
  tertiary-fixed-dim: "#6ee7b7"
  on-tertiary-fixed: "#022c22"
  on-tertiary-fixed-variant: "#047857"

  # Neutral, Borders & Shadows
  outline: "#d7e7ed"
  outline-variant: "#eef5f8"
  surface-tint: "#0891b2"

  # Feedback & State Colors
  error: "#ef4444"
  on-error: "#ffffff"
  error-container: "#fef2f2"
  on-error-container: "#991b1b"

typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: "800"
    lineHeight: "1.15"
    letterSpacing: -0.025em
  display-lg-mobile:
    fontFamily: Manrope
    fontSize: 34px
    fontWeight: "800"
    lineHeight: "1.2"
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 36px
    fontWeight: "700"
    lineHeight: "1.25"
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: "700"
    lineHeight: "1.3"
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Manrope
    fontSize: 22px
    fontWeight: "600"
    lineHeight: "1.35"
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: "400"
    lineHeight: "1.6"
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: "400"
    lineHeight: "1.6"
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "400"
    lineHeight: "1.5"
  label-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: "600"
    lineHeight: "1.3"
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: "600"
    lineHeight: "1.2"
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: "600"
    lineHeight: "1.2"
    letterSpacing: 0.02em

rounded:
  xs: 0.25rem
  sm: 0.375rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.25rem
  2xl: 1.5rem
  full: 9999px

spacing:
  unit: 8px
  container-max: 1280px
  container-wide: 1440px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

# Credify Design System & UI Specification

**Branch:** `refactor/ui-design`  
**Last Updated:** September 2026  
**Status:** Living Design Specification

---

## 1. Brand Identity & Visual Philosophy

Credify is an intelligence-driven recruitment and talent management platform that bridges verified candidates, high-growth companies, and recruiters. The UI design language embodies **Modern Professionalism, Rigorous Trust, and Technological Agility**.

### Core Tenets

1. **Precision & Trust First:** Recruitment involves sensitive career moves and hiring budgets. Visual clarity, high data legibility, and evident verification markers (such as verified checkmarks and tamper-evident badges) instill confidence immediately.
2. **Generous Whitespace & Cognitive Ease:** Complex hiring workflows, candidate profiles, and job listings can easily overwhelm. We employ intentional vertical rhythms, generous padding, and structured grid cards to reduce cognitive load.
3. **Atmospheric Depth over Flatness:** Soft diffused glows, subtle glassmorphic backdrop filters, and delicate tonal layer transitions give the interface a sleek, premium product feel in both light and dark modes.
4. **Fluid Motion with Purpose:** Micro-interactions (hover cards, loading progress, animated pills, marquee scrollers) signal responsiveness without hindering fast navigation.

---

## 2. Color System

Credify uses a dual-palette architecture engineered for seamless Light and Dark mode parity, adhering strictly to **WCAG 2.1 AA** contrast ratios (minimum 4.5:1 for body copy and 3:1 for large display elements).

### 2.1 Primary Brand & Accent Colors

| Role                | Light Token                                          | Dark Token                                           | CSS Variable             | Usage                                                          |
| :------------------ | :--------------------------------------------------- | :--------------------------------------------------- | :----------------------- | :------------------------------------------------------------- |
| **Primary**         | `#0891b2` (Cyan 600)                                 | `#22d3ee` (Cyan 400)                                 | `--color-primary`        | Primary action buttons, active navigation, key highlights      |
| **Primary Hover**   | `#0e7490` (Cyan 700)                                 | `#06b6d4` (Cyan 500)                                 | `--color-primary-hover`  | Button hover states, interactive link hover                    |
| **Primary Active**  | `#155e75` (Cyan 800)                                 | `#0891b2` (Cyan 600)                                 | `--color-primary-active` | Button press, active tab indicator                             |
| **Primary Light**   | `#ecfeff` (Cyan 50)                                  | `rgba(34,211,238,0.12)`                              | `--color-primary-light`  | Pill backgrounds, subtle badge fills, selected card highlights |
| **Accent / Growth** | `#38d996` (Mint 500)                                 | `#38d996` (Mint 400)                                 | `--color-accent`         | Verification checks, salary upticks, candidate availability    |
| **Brand Gradient**  | `linear-gradient(135deg, #0891b2, #06b6d4, #22d3ee)` | `linear-gradient(135deg, #06b6d4, #22d3ee, #38d996)` | `--color-brand-gradient` | Wordmark highlights, hero CTAs, top progress bar               |

### 2.2 Surface & Canvas Architecture

The background hierarchy uses layered elevation to create natural separation:

```
[ Canvas (Level 0) ]  ->  [ Card / Section (Level 1) ]  ->  [ Popover / Drawer (Level 2) ]  ->  [ Modal / Dialog (Level 3) ]
```

- **Light Mode:**
  - **Level 0 (Canvas):** `#ffffff` with subtle radial cyan glow (`rgba(6, 182, 212, 0.05)`)
  - **Level 1 (Surfaces & Cards):** `#f8fafc` or `#ffffff` with 1px border (`#e2e8f0` / `#d7e7ed`)
  - **Level 2 (Dropdowns & Drawers):** `#ffffff` with `0px 10px 25px -5px rgba(6, 23, 34, 0.08)`
  - **Level 3 (Modals):** `#ffffff` with dark overlay (`rgba(6, 23, 34, 0.6)`)
- **Dark Mode:**
  - **Level 0 (Canvas):** `#061722` (Deep Obsidian / Midnight Slate) with ambient cyan glow (`rgba(34, 211, 238, 0.10)`)
  - **Level 1 (Surfaces & Cards):** `#0b2432` with 1px border (`#153243` / `#2e4a57`)
  - **Level 2 (Dropdowns & Drawers):** `#102d3e` with `0px 14px 35px -5px rgba(0, 0, 0, 0.5)`
  - **Level 3 (Modals):** `#0e2737` with backdrop blur and overlay (`rgba(2, 8, 14, 0.75)`)

### 2.3 Semantic & Feedback States

| State                  | Foreground / Text           | Background Tint                 | Border Color                    | Icon / Indicator              |
| :--------------------- | :-------------------------- | :------------------------------ | :------------------------------ | :---------------------------- |
| **Success / Verified** | `#059669` (Dark: `#34d399`) | `#ecfdf5` (Dark: `#064e3b`/30%) | `#a7f3d0` (Dark: `#059669`/50%) | `CheckCircle2`, `ShieldCheck` |
| **Warning / Pending**  | `#d97706` (Dark: `#fbbf24`) | `#fffbeb` (Dark: `#78350f`/30%) | `#fde68a` (Dark: `#d97706`/50%) | `Clock`, `AlertTriangle`      |
| **Error / Rejected**   | `#dc2626` (Dark: `#f87171`) | `#fef2f2` (Dark: `#7f1d1d`/30%) | `#fecaca` (Dark: `#dc2626`/50%) | `AlertCircle`, `XCircle`      |
| **Info / In Review**   | `#0284c7` (Dark: `#38bdf8`) | `#f0f9ff` (Dark: `#0c4a6e`/30%) | `#bae6fd` (Dark: `#0284c7`/50%) | `Info`, `FileText`            |

---

## 3. Typography System

Credify uses a dual-font pairing optimized for modern screens and fast scanning:

- **Headlines & Display:** **Manrope** (geometric, friendly, authoritative).
- **Body Copy & Interactive Controls:** **Inter** (high x-height, exceptional legibility at small sizes).
- **Code & Monospace Data:** **JetBrains Mono** or `ui-monospace` (for IDs, salary metrics, timestamps).

### Type Hierarchy Scale

| Token               | Size             | Line Height | Weight        | Tracking   | Usage                                             |
| :------------------ | :--------------- | :---------- | :------------ | :--------- | :------------------------------------------------ |
| `display-lg`        | 48px (3rem)      | 1.15        | 800 Extrabold | `-0.025em` | Hero landing headlines                            |
| `display-lg-mobile` | 34px (2.125rem)  | 1.20        | 800 Extrabold | `-0.02em`  | Mobile hero headlines                             |
| `headline-lg`       | 36px (2.25rem)   | 1.25        | 700 Bold      | `-0.02em`  | Page headers, major section titles                |
| `headline-md`       | 28px (1.75rem)   | 1.30        | 700 Bold      | `-0.015em` | Card grid titles, drawer headers                  |
| `headline-sm`       | 22px (1.375rem)  | 1.35        | 600 SemiBold  | `-0.01em`  | Job titles, modal titles, subsection headers      |
| `body-lg`           | 18px (1.125rem)  | 1.60        | 400 Regular   | `0`        | Hero subheadings, lead paragraphs                 |
| `body-md`           | 16px (1.0rem)    | 1.60        | 400 / 500     | `0`        | Standard body text, form input text, descriptions |
| `body-sm`           | 14px (0.875rem)  | 1.50        | 400 / 500     | `0`        | Secondary copy, metadata, table data cells        |
| `label-md`          | 13px (0.8125rem) | 1.20        | 600 SemiBold  | `+0.01em`  | Form labels, button text, table column headers    |
| `label-sm`          | 11px (0.6875rem) | 1.20        | 600 SemiBold  | `+0.02em`  | Status chips, tags, timestamps, breadcrumbs       |

---

## 4. Spacing, Grid & Layout

### 4.1 8-Point Linear Spacing Scale

All margins, paddings, and element dimensions adhere to multiples of 8px (with a 4px sub-unit for tight micro-spacing):

```text
4px  (0.5x) -> Micro gaps, icon padding
8px  (1.0x) -> Tight padding, pill gaps, button icon spacing
16px (2.0x) -> Standard input padding, mobile card margins, badge spacing
24px (3.0x) -> Card internal padding, desktop gutters, form field vertical gap
32px (4.0x) -> Medium section margins, header vertical padding
48px (6.0x) -> Major block separation, dashboard widget spacing
64px (8.0x) -> Section separation on desktop
96px (12.0x)-> Landing page major chapter separation
```

### 4.2 Breakpoints & Containers

- **Mobile (`< 640px`):** Single column, 16px horizontal page gutters, compact headers.
- **Tablet (`640px - 1023px`):** 2-column card layouts, 24px gutters.
- **Desktop (`1024px - 1279px`):** 3-column / 12-column grid, 32px gutters, max-width `1280px` (`max-w-7xl`).
- **Wide Screen (`>= 1280px`):** Fluid grid with centered containers up to `1440px` (`max-w-7xl` or custom wide).

---

## 5. Shape & Elevation Language

### 5.1 Corner Roundness

- **`rounded-sm` (4px):** Badges, notification count dots, micro-chips.
- **`rounded-md` (8px):** Buttons, text inputs, selects, dropdown menus.
- **`rounded-xl` (16px):** Job cards, dashboard widgets, profile preview boxes.
- **`rounded-2xl` (24px):** Hero search bar container, Bento grid feature cards, modals.
- **`rounded-full` (9999px):** Avatar images, status indicator pills, filter chips.

### 5.2 Shadows & Depth

- **Resting Card:** `0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)`
- **Interactive Hover Card:** `0 10px 25px -5px rgba(8, 145, 178, 0.08), 0 8px 10px -6px rgba(8, 145, 178, 0.04)`
- **Floating Popover / Dropdown:** `0 12px 32px -4px rgba(6, 23, 34, 0.12), 0 4px 6px -2px rgba(6, 23, 34, 0.04)`
- **Dark Mode Glow:** `0 0 20px -2px rgba(34, 211, 238, 0.15)` for active inputs and key CTAs.

---

## 6. Core Component Specifications

### 6.1 Buttons

1. **Primary Button:**
   - Style: Solid Cyan gradient (`bg-linear-to-r from-cyan-600 to-cyan-500` in light, `from-cyan-500 to-teal-400` in dark), text `#ffffff` or dark contrast.
   - State: Subtly expands/glows on hover (`shadow-md shadow-cyan-500/20`), active scale `0.98`.
   - Height: 44px (touch-friendly), padding `px-5 py-2.5`, radius `rounded-lg` (8px).
2. **Secondary / Outline Button:**
   - Style: Transparent background, 1px border (`border-slate-300 dark:border-slate-700`), text `text-slate-800 dark:text-slate-200`.
   - State: Hover background `bg-slate-100 dark:bg-slate-800/60`, border transitions to `border-cyan-500`.
3. **Ghost / Tertiary Button:**
   - Style: No border, transparent background, text `text-slate-600 hover:text-cyan-600 dark:text-slate-300 dark:hover:text-cyan-400`.
4. **Destructive Button:**
   - Style: Light red tint (`bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400`).

### 6.2 Form Inputs & Controls

- **Height & Padding:** Standard height 42px, internal padding `px-3.5 py-2.5`, text `body-md`.
- **Resting State:** 1px border `border-slate-200 dark:border-slate-700`, background transparent or surface.
- **Focus State:** 1.5px border `border-cyan-500`, subtle outer ring `ring-3 ring-cyan-500/15`, transition 150ms.
- **Error State:** Border `border-red-500`, ring `ring-3 ring-red-500/15`, helper text in red with an `AlertCircle` icon.
- **Label Placement:** Top-aligned with 6px gap, typography `label-md` (`font-medium text-slate-700 dark:text-slate-300`).

### 6.3 Job & Candidate Cards

- **Container:** 16px corner radius, internal padding 24px (`p-6`), border 1px `border-slate-200/80 dark:border-slate-800`.
- **Header Row:** Company/Candidate avatar (48x48px, rounded-xl), Title (headline-sm), Company Name & Location (body-sm).
- **Tag Cluster:** Pill chips for Work Type (`Remote`, `Hybrid`, `On-site`), Employment Type (`Full-time`, `Contract`), and Tech Stack.
- **Footer Row:** Compensation range (bold, highlighted in emerald/cyan), Posted timestamp, and Quick-Action button (`Apply` / `View Details`).

### 6.4 Status Chips & Badges

All status badges follow a standardized pill format (`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5`):

- `Submitted`: Neutral Gray (`bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300`)
- `In Review`: Info Blue (`bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300`)
- `Shortlisted`: Cyan Accent (`bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300`)
- `Interviewed`: Purple Accent (`bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300`)
- `Offered`: Emerald Success (`bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300`)
- `Rejected`: Rose / Red (`bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300`)
- `Withdrawn`: Muted Gray (`bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400`)

### 6.5 Top Progress Bar & Skeleton Loaders

- **Top Progress Bar:** 3px sticky bar at top of viewport with smooth ease-in animation and cyan-to-mint gradient.
- **Shimmer Skeletons:** Standard pulse/shimmer animation (`bg-slate-200/70 dark:bg-slate-800/80 animate-pulse`), exactly mirroring final card geometries to eliminate layout shift (CLS = 0).

---

## 7. Motion & Micro-interactions

1. **Page Transitions:** Top progress bar tracks pending navigation; main containers fade-in smoothly (`opacity: 0 -> 1`, `duration: 0.2s`).
2. **Hover States:** Cards lift slightly (`translate-y: -2px`) with intensified shadow on hover.
3. **Infinite Marquees:** Smooth 38s linear loop for company logos and skills on desktop (26s mobile). Pauses immediately on hover, touch, or keyboard focus. Respects `prefers-reduced-motion`.
4. **Notification Drawer / Popovers:** Spring animation with `scale: 0.95 -> 1.0` and `opacity: 0 -> 1` on open.

---

## 8. Accessibility (A11y) Guidelines

- **Keyboard Navigation:** All interactive elements (buttons, inputs, tabs, dropdowns, modal close buttons) are fully navigable via `Tab`, `Enter`, `Space`, and `Escape`.
- **Focus Indicator:** High-contrast `focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950`.
- **Screen Reader Labels:** All icon-only triggers (notifications bell, mobile menu toggle, theme switcher, modal close) carry descriptive `aria-label` attributes.
- **Minimum Touch Target:** 44px x 44px hit-box on all interactive elements for mobile touch devices.

---

## 9. Implementation Architecture (Tailwind CSS v4 & Next.js 16)

```text
client/src/
├── app/
│   ├── globals.css            # Base Tailwind theme, CSS variables, keyframe animations
│   ├── layout.tsx             # Root Layout: Theme Script, Ambient Glows, TopProgressBar, AuthProvider
│   ├── (public)/              # Landing, Jobs board, Job details
│   ├── (auth)/                # Auth layouts (Login, Register, Password Recovery)
│   ├── (candidate)/           # Candidate workspace (Dashboard, Profile, Applications)
│   └── (recruiter)/           # Recruiter workspace (Dashboard, Jobs, Candidates, Pipelines)
├── components/
│   ├── Header.tsx             # Sticky responsive navigation with role switching & notifications
│   ├── Footer.tsx             # Semantic footer with brand directory
│   ├── Logo.tsx               # Geometric SVG Logo with brand gradients
│   ├── ThemeToggle.tsx        # Zero-layout-shift theme switcher
│   └── ui/
│       ├── skeletons/         # Standardized skeleton states for all routes
│       └── TopProgressBar.tsx # Transition feedback bar
```

This design specification serves as the single source of truth for all UI refactoring and component implementations across the `refactor/ui-design` branch.
