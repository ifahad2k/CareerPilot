// ============================================================
// CareerPilot v2 — CV Chunker
// ============================================================
// 
// Section-aware chunking strategy:
// - summary: single chunk
// - experience: one chunk per job role (preserves context)
// - education: one chunk per degree
// - projects: one chunk per project
// - skills: all skills concatenated into one chunk
// 
// Max chunk size: ~800 characters
// ============================================================

export interface CVChunk {
  section: 'summary' | 'experience' | 'education' | 'projects' | 'skills';
  chunkIndex: number;
  content: string;
}

const MAX_CHUNK_CHARS = 800;

/**
 * Chunk parsed CV sections into semantic units
 * Each chunk is one section entry, split if too long
 */
export function chunkCV(
  sections: Record<string, string | string[]>
): CVChunk[] {
  const chunks: CVChunk[] = [];
  let globalIndex = 0;

  const addChunk = (section: CVChunk['section'], content: string) => {
    if (!content?.trim()) return;
    if (content.length <= MAX_CHUNK_CHARS) {
      chunks.push({ section, chunkIndex: globalIndex++, content: content.trim() });
    } else {
      splitIntoChunks(content, MAX_CHUNK_CHARS).forEach(part =>
        chunks.push({ section, chunkIndex: globalIndex++, content: part.trim() })
      );
    }
  };

  if (sections.summary) addChunk('summary', sections.summary as string);
  if (Array.isArray(sections.experience)) {
    (sections.experience as string[]).forEach(e => addChunk('experience', e));
  }
  if (Array.isArray(sections.education)) {
    (sections.education as string[]).forEach(e => addChunk('education', e));
  }
  if (Array.isArray(sections.projects)) {
    (sections.projects as string[]).forEach(p => addChunk('projects', p));
  }
  if (Array.isArray(sections.skills)) {
    addChunk('skills', (sections.skills as string[]).join(', '));
  }

  return chunks;
}

/**
 * Split long text into chunks by sentence boundaries
 * Never cuts mid-sentence if possible
 */
function splitIntoChunks(text: string, maxChars: number): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    if ((current + sentence).length <= maxChars) {
      current += (current ? ' ' : '') + sentence;
    } else {
      if (current) chunks.push(current);
      current = sentence;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}
