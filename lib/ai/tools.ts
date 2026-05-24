// ============================================================
// CareerPilot v2 — AI Tool Functions
// ============================================================
// 
// Tool functions for Gemini LLM:
// - searchJobs: Job search via Adzuna API
// - analyzeCV: Parse and analyze uploaded CV
// - generateRoadmap: Create learning roadmap
// ============================================================

import { searchJobs, SearchJobsParams } from '@/lib/jobs/adzuna';

export { searchJobs };
export type { SearchJobsParams };
