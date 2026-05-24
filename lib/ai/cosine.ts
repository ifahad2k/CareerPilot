// ============================================================
// CareerPilot v2 — In-Memory Cosine Similarity
// ============================================================
// 
// For <500 chunks per user, loading all chunks into memory
// and computing cosine similarity in Node.js takes <50ms.
// No pgvector, no SQL, no extra service needed.
// 
// Embeddings stored as arrays in Firestore documents.
// ============================================================

export interface ScoredChunk {
  id: string;
  content: string;
  section: string;
  embedding: number[];
  similarity: number;
}

/**
 * Compute cosine similarity between two vectors
 * Both vectors must be same length
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length');
  }

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  const denominator = Math.sqrt(magA) * Math.sqrt(magB);
  
  if (denominator === 0) return 0;
  
  return dot / denominator;
}

/**
 * Rank chunks by cosine similarity to query embedding
 * Returns top-K most similar chunks
 */
export function rankChunks(
  queryEmbedding: number[],
  chunks: Array<{
    id: string;
    content: string;
    section: string;
    embedding: number[];
  }>,
  topK: number,
  filterSection?: string
): ScoredChunk[] {
  return chunks
    .filter(c => !filterSection || c.section === filterSection)
    .map(c => ({
      ...c,
      similarity: cosineSimilarity(queryEmbedding, c.embedding),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}