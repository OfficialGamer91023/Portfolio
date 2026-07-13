// Shared TypeScript interfaces for the backend API

export interface ProjectResponse {
  id: number;
  title: string;
  description: string;
  tags: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  featured: boolean;
  order: number;
  createdAt: Date;
}

export interface ExperienceResponse {
  id: number;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string | null;
  bullets: string[];
  order: number;
}

export interface SkillResponse {
  id: number;
  name: string;
  category: string;
}

export interface SkillGroupResponse {
  category: string;
  skills: string[];
}

export interface ContactSubmissionRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactSubmissionResponse {
  success: boolean;
  id: number;
}

export interface ApiErrorResponse {
  error: string;
  status: number;
}
