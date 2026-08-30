// Shared TypeScript interfaces for the frontend

export interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  featured: boolean;
  order: number;
  createdAt: string;
  problem: string | null;
  method: string | null;
  verified: string | null;
  subtitle: string | null;
  figNo: string | null;
}

export interface Contribution {
  id: number;
  project: string;
  detail: string;
  status: string;
  statusKind: string;
  url: string | null;
  order: number;
}

export interface Run {
  id: number;
  date: string;
  km: number;
  pace: number;
  dur: number;
  speed: number;
  hr: number | null;
  elev: number | null;
  cal: number | null;
  note: string | null;
}

export interface Experience {
  id: number;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string | null;
  bullets: string[];
  order: number;
}

export interface SkillGroup {
  category: string;
  skills: string[];
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactSubmissionResponse {
  success: boolean;
  id: number;
}

export interface ApiError {
  error: string;
  status: number;
}
