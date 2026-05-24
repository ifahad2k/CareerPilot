// ============================================================
// CareerPilot v2 — CV Embedder
// ============================================================
// 
// Embeds CV chunks using Gemini text-embedding-004 (768-dim)
// Stores in Firestore for in-memory cosine similarity search
// ============================================================

import { generateEmbedding } from '@/lib/ai/embeddings';
import { CVChunk } from '@/types';

/**
 * Embed a single chunk of CV text
 * Returns the embedding vector (768-dim)
 */
export async function embedChunk(content: string): Promise<number[]> {
  return generateEmbedding(content);
}

/**
 * Embed multiple CV chunks in parallel
 * Optimized for batch processing during CV upload
 */
export async function embedChunks(chunks: { content: string }[]): Promise<number[][]> {
  const embeddings = await Promise.all(
    chunks.map(chunk => embedChunk(chunk.content))
  );
  return embeddings;
}

/**
 * Create CVChunk objects with embeddings for Firestore
 */
export async function createEmbeddedChunks(
  userId: string,
  cvId: string,
  chunks: { section: CVChunk['section']; chunkIndex: number; content: string }[]
): Promise<CVChunk[]> {
  const embeddings = await embedChunks(chunks);
  
  return chunks.map((chunk, i) => ({
    id: `${cvId}_${chunk.section}_${chunk.chunkIndex}`,
    user_id: userId,
    cv_id: cvId,
    section: chunk.section,
    chunk_index: chunk.chunkIndex,
    content: chunk.content,
    embedding: embeddings[i],
  }));
}
