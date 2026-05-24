// ============================================================
// CareerPilot v2 — TypeScript Type Definitions
// ============================================================
// 
// Uses Firebase Auth + Firestore + Gemini
// ============================================================

export type UserId = string;
export type CVId = string;

// ── Profile ────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  target_role: string | null;
  target_location: string | null;
  created_at: string;
}

// ── CV ─────────────────────────────────────────────────────────────────────

export interface CV {
  id: string;
  user_id: string;
  filename: string;
  raw_text: string;
  parsed_sections: {
    summary?: string;
    experience?: string[];
    education?: string[];
    skills?: string[];
    projects?: string[];
  };
  uploaded_at: string;
}

// CV Chunk with 768-dim Gemini embedding
export interface CVChunk {
  id: string;
  user_id: string;
  cv_id: string;
  section: 'summary' | 'experience' | 'education' | 'skills' | 'projects';
  chunk_index: number;
  content: string;
  embedding: number[]; // 768-dim Gemini text-embedding-004
}

// ── Jobs (Adzuna API) ──────────────────────────────────────────────────────

export interface Job {
  job_id: string;
  job_title: string;
  employer_name: string;
  job_city: string;
  job_country: string;
  job_description: string;
  job_apply_link: string;
  job_posted_at_datetime_utc: string;
  job_min_salary?: number;
  job_max_salary?: number;
  job_employment_type: string;
  fit_score?: FitScoreResult;
}

// ── Applications ──────────────────────────────────────────────────────────

export type ApplicationStatus = 'applied' | 'interviewing' | 'offer' | 'rejected';

export interface Application {
  id: string;
  user_id: string;
  role: string;
  company: string;
  location: string | null;
  salary_range: string | null;
  job_url: string | null;
  status: ApplicationStatus;
  applied_at: string;
  notes: string | null;
  fit_score: number | null;
  created_at: string;
  updated_at: string;
}

// ── Goals & Todos ─────────────────────────────────────────────────────────

export type TodoPriority = 'low' | 'medium' | 'high';
export type GoalCategory = 'apply' | 'learn' | 'cv' | 'general';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  completed: boolean;
  category: GoalCategory;
  created_at: string;
}

export interface Todo {
  id: string;
  user_id: string;
  goal_id: string | null;
  title: string;
  due_date: string | null;
  completed: boolean;
  priority: TodoPriority;
  created_at: string;
}

// ── Chat ───────────────────────────────────────────────────────────────────

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  rag_chunks_used: CVChunk[];
  created_at: string;
}

// ── Roadmap ────────────────────────────────────────────────────────────────

export interface Roadmap {
  id: string;
  user_id: string;
  target_role: string;
  weeks: RoadmapWeek[];
  progress_percent: number;
  created_at: string;
}

export interface RoadmapWeek {
  week: number;
  theme: string;
  tasks: string[];
  resources: { title: string; url: string; type: 'course' | 'book' | 'practice' | 'article' }[];
  milestone: string;
}

// ── AI Analysis ───────────────────────────────────────────────────────────

export interface FitScoreResult {
  total: number; // 0-100
  breakdown: {
    skills: number;
    experience: number;
    education: number;
  };
  explanation: string;
}

export interface GapAnalysis {
  target_role: string;
  match_score: number;
  strengths: string[];
  gaps: { skill: string; priority: 'high' | 'medium' | 'low'; how_to_learn: string }[];
  verdict: string;
}

export interface RAGResult {
  chunks: CVChunk[];
  contextString: string;
}
