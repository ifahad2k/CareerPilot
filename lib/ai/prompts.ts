// ============================================================
// CareerPilot — All System Prompts
// ============================================================
// 
// SINGLE SOURCE OF TRUTH for all AI prompts
// Used by every API route for consistency
// 
// PROMPTS:
// - JOB_HUNTER: Job search agent with tool calls
// - ASSISTANT: Personal AI career coach
// - FIT_SCORE_EXPLAINER: Fit score breakdown
// - COVER_LETTER: Personalized cover letter
// - ROADMAP: Weekly learning roadmap
// - GAP_ANALYSIS: Skills gap analysis
// - NUDGE: Proactive encouragement
// ============================================================

export const PROMPTS = {
  JOB_HUNTER: (cvContext: string) => ``,
  ASSISTANT: (cvContext: string) => ``,
  FIT_SCORE_EXPLAINER: (cvContext: string, jobDescription: string, score: number) => ``,
  COVER_LETTER: (cvContext: string, jobDescription: string, company: string, role: string) => ``,
  ROADMAP: (cvContext: string, targetRole: string, durationWeeks: number) => ``,
  GAP_ANALYSIS: (cvContext: string, durationWeeks: number) => ``,
  NUDGE: (cvContext: string, targetRole: string) => ``,
};
