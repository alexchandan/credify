export type ApplicationStatus =
  | "applied"
  | "under_review"
  | "shortlisted"
  | "rejected"
  | "hired"
  | "withdrawn";

export interface ApplicationCandidate {
  _id: string;
  fullName: string;
  headline?: string;
  avatarUrl?: string;
  skills: string[];
  location?: string[];
  email?: string;
}

export interface ApplicationJob {
  _id: string;
  title: string;
  location: string[];
  employmentType: "full_time" | "part_time" | "contract" | "internship";
  experienceLevel: "entry" | "mid" | "senior" | "lead";
  isRemote: boolean;
  salaryRange?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  status: "draft" | "published" | "closed";
}

export interface ApplicationCompany {
  _id: string;
  name: string;
  logoUrl?: string;
}

export interface StatusHistoryEntry {
  status: ApplicationStatus;
  changedAt: string;
  changedBy: string;
}

export interface Application {
  _id: string;
  candidateId: string;
  jobId: string;
  companyId: string;
  status: ApplicationStatus;
  resumeSnapshotUrl: string;
  coverLetter?: string;
  statusHistory: StatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
  candidate?: ApplicationCandidate | null;
  job?: ApplicationJob | null;
  company?: ApplicationCompany | null;
}
