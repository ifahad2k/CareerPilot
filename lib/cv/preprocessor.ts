// ============================================================
// CareerPilot v2 — CV Text Preprocessor
// ============================================================
// 
// PDF extraction often produces messy text:
// - Excessive whitespace
// - Strange characters
// - Broken line breaks
// 
// This preprocessor cleans it for better chunking.
// ============================================================

/**
 * Clean messy PDF/DOCX extraction output
 */
export function preprocessText(text: string): string {
  return text
    // Collapse multiple spaces into single space
    .replace(/\s+/g, ' ')
    // Collapse excessive newlines (more than 2)
    .replace(/\n{3,}/g, '\n\n')
    // Remove non-printable characters
    .replace(/[^\x20-\x7E\n]/g, '')
    // Fix broken line breaks mid-sentence
    .replace(/([a-z])\n([a-z])/gi, '$1 $2')
    // Trim whitespace
    .trim();
}