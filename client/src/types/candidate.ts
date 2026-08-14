export type Availability =
  "immediate" | "within_two_weeks" | "within_one_month" | "not_looking";

export const AVAILABILITY_OPTIONS: { value: Availability; label: string }[] = [
  { value: "immediate", label: "Immediate" },
  { value: "within_two_weeks", label: "2 Weeks Notice" },
  { value: "within_one_month", label: "1 Month Notice" },
  { value: "not_looking", label: "Not Looking" },
];

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
  grade?: string;
}

export interface Experience {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
}

export interface ProjectEntry {
  title: string;
  description?: string;
  techStack: string[];
  link?: string;
}

export interface Certification {
  name: string;
  issuingOrg: string;
  issueDate: string;
  expiryDate?: string;
  credentialUrl?: string;
}

export interface SocialLinks {
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  twitter?: string;
}

export interface CandidateProfile {
  _id: string;
  userId: string;
  fullName: string;
  headline?: string;
  skills: string[];
  location?: string;
  availability: Availability;
  avatarUrl?: string;
  avatarPublicId?: string;
  avatarUploadedAt?: string;
  resumeUrl?: string;
  resumePublicId?: string;
  resumeUploadedAt?: string;
  education: Education[];
  experience: Experience[];
  projects: ProjectEntry[];
  certifications: Certification[];
  socialLinks: SocialLinks;
}
