export type ApplicationStatus =
  | "applied"
  | "under_review"
  | "shortlisted"
  | "rejected"
  | "hired"
  | "withdrawn";

export interface RecentApplication {
  _id: string;
  jobId: string;
  status: ApplicationStatus;
  createdAt: string;
  jobTitle: string | null;
}

export interface DashboardNotification {
  _id: string;
  type:
    | "application_received"
    | "application_status_changed"
    | "job_published"
    | "candidate_saved";
  message: string;
  relatedEntityType?: "Job" | "Application" | "CandidateProfile";
  relatedEntityId?: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface CandidateDashboard {
  profileCompletionPercent: number;
  resumeStatus: {
    hasResume: boolean;
    resumeUrl: string | null;
    uploadedAt: string | null;
  };
  applications: {
    total: number;
    byStatus: Partial<Record<ApplicationStatus, number>>;
  };
  recentApplications: RecentApplication[];
  recentNotifications: DashboardNotification[];
  unreadNotificationsCount: number;
}
