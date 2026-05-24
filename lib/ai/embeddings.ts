// ============================================================
// CareerPilot v2 — Gemini Embeddings Utility
// ============================================================
// 
// Uses Gemini text-embedding-004 (768 dimensions)
// Free tier: text-embedding-004 has generous quota
// Docs: https://ai.google.dev/tutorials/node_quickstart
// ============================================================

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * Generate embedding for a single text using Gemini
 * Returns embedding vector (768-dim)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

/**
 * Batch embed multiple texts using Gemini
 * Returns array of embedding vectors (768-dim)
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  
  // Process in parallel for speed
  const results = await Promise.all(
    texts.map(text => model.embedContent(text))
  );
  
  return results.map(r => r.embedding.values);
}

/**
 * Embed a single text using Gemini
 * Returns embedding vector (768-dim)
 */
export async function embedText(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  const result = await model.embedContent(text);
  return result.embedding.values;
}
