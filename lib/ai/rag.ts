// ============================================================
// CareerPilot v2 — Core RAG Query Function
// ============================================================
// 
// THE MOST IMPORTANT FILE IN THE PROJECT
// 
// Every AI output is grounded in the user's actual CV.
// No agent fabricates experience. If it's not in the CV,
// the AI says so.
// 
// Architecture:
// 1. Load user's CV chunks from Firestore
// 2. Embed the query using Gemini
// 3. Compute cosine similarity in-memory
// 4. Return top-K chunks for LLM context injection
// ============================================================

import { adminDb } from '@/lib/firebase/admin';
import { embedText } from './embeddings';
import { rankChunks, ScoredChunk } from './cosine';

// Firestore collection structure:
// - cvChunks/{userId}/chunks/{chunkId}
//   - section: string ('experience' | 'skills' | 'education' | 'projects' | 'summary')
//   - chunkIndex: number
//   - content: string
//   - embedding: number[] (768-dim Gemini vector)

export interface RAGResult {
  chunks: ScoredChunk[];
  contextString: string;
}

/**
 * Query the RAG store with a user question
 * Returns relevant CV chunks ranked by similarity
 * 
 * @param query - User's question or search query
 * @param userId - Firebase user ID
 * @param options - { topK: number, filterSection?: string }
 */
export async function queryRAG(
  query: string,
  userId: string,
  options: { topK?: number; filterSection?: string } = {}
): Promise<RAGResult> {
  const { topK = 5, filterSection } = options;

  // 1. Load all user chunks from Firestore
  const chunksSnap = await adminDb
    .collection('cvChunks')
    .doc(userId)
    .collection('chunks')
    .get();

  if (chunksSnap.empty) {
    return {
      chunks: [],
      contextString: 'No CV data found. Please upload your CV first.',
    };
  }

  const allChunks = chunksSnap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      content: data.content as string,
      section: data.section as string,
      embedding: data.embedding as number[],
    };
  });

  // 2. Embed the query
  const queryEmbedding = await embedText(query);

  // 3. Rank by cosine similarity in memory
  const ranked = rankChunks(queryEmbedding, allChunks, topK, filterSection);

  // 4. Format context string for LLM injection
  const contextString = ranked
    .map(c => `[${c.section.toUpperCase()}]\n${c.content}`)
    .join('\n\n---\n\n');

  return { chunks: ranked, contextString };
}
