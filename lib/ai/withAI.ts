// ============================================================
// CareerPilot v2 — AI Error Handling Wrapper
// ============================================================
// 
// Wraps AI calls with graceful error handling.
// If AI fails, returns fallback data instead of crashing.
// This keeps the demo running even if Gemini is rate-limited.
// ============================================================

export interface AIResult<T> {
  data: T;
  error: string | null;
}

/**
 * Execute an AI function with error handling
 * 
 * @param fn - Async function that calls Gemini
 * @param fallback - Value to return if AI call fails
 * @param errorMessage - Optional custom error message
 * @returns Promise with data and optional error string
 */
export async function withAI<T>(
  fn: () => Promise<T>,
  fallback: T,
  errorMessage = 'AI service temporarily unavailable'
): Promise<AIResult<T>> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (err) {
    console.error('[AI Error]', err);
    return { data: fallback, error: errorMessage };
  }
}