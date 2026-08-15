import {
  CircleDot,
  Clock3,
  Sparkles,
  Trophy,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import type { ApplicationStatus } from "@/types/dashboard";

export const STATUS_DETAILS: Record<
  ApplicationStatus,
  { label: string; className: string; icon: LucideIcon }
> = {
  applied: {
    label: "Applied",
    className:
      "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
    icon: CircleDot,
  },
  under_review: {
    label: "Under review",
    className:
      "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
    icon: Clock3,
  },
  shortlisted: {
    label: "Shortlisted",
    className:
      "bg-cyan-50 text-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-300",
    icon: Sparkles,
  },
  rejected: {
    label: "Not selected",
    className: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300",
    icon: XCircle,
  },
  hired: {
    label: "Hired",
    className:
      "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
    icon: Trophy,
  },
  withdrawn: {
    label: "Withdrawn",
    className:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    icon: XCircle,
  },
};

export const APPLICATION_STATUSES = Object.keys(
  STATUS_DETAILS,
) as ApplicationStatus[];
