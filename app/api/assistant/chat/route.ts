// ============================================================
// CareerPilot — AI Chat API Route
// ============================================================
//
// Pillar 3 — Personal AI Assistant
// - RAG-grounded responses using CV context
// - Session memory (last 10 messages)
// - Streaming responses via Gemini 2.5 Flash
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { verifyAuthToken } from '@/lib/firebase/auth';
import { queryRAG } from '@/lib/ai/rag';
import { ChatMessage } from '@/types';

export const dynamic = 'force-dynamic';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * Chat endpoint - RAG-grounded AI responses
 * POST /api/assistant/chat
 */
export async function POST(req: NextRequest) {
  // Verify authentication
  const userId = await verifyAuthToken(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { message, history = [] } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Query RAG for CV context
    const ragResult = await queryRAG(message, userId, { topK: 5 });

    // Build conversation history string
    const historyString = history
      .slice(-10)
      .map((m: ChatMessage) => `${m.role}: ${m.content}`)
      .join('\n');

    // Build system prompt
    const systemPrompt = `You are CareerPilot, an AI career assistant. You have access to the user's CV data (shown below in [SECTION] format).

IMPORTANT RULES:
1. Only reference skills, experience, or qualifications that appear in the CV context below
2. If something is not in the CV, say "I don't see that in your CV" or suggest they add it
3. Be specific and actionable in your advice
4. Keep responses concise but informative

CV CONTEXT:
${ragResult.contextString || 'No CV data available. Please upload your CV to get personalized advice.'}

Respond to the user's question using only information from their CV. If you're unsure or the information isn't available, say so clearly.`;

    // Build full prompt
    const fullPrompt = historyString
      ? `${systemPrompt}\n\nCONVERSATION HISTORY:\n${historyString}\n\nUser: ${message}`
      : `${systemPrompt}\n\nUser: ${message}`;

    // Generate response
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(fullPrompt);
    const response = result.response.text();

    return NextResponse.json({
      response,
      ragChunks: ragResult.chunks.map(c => ({
        id: c.id,
        section: c.section,
        content: c.content,
      })),
    });

  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
