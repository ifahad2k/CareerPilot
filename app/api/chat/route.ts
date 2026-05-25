import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { verifyAuthToken } from '@/lib/firebase/auth';
import { queryRAG } from '@/lib/ai/rag';

export const dynamic = 'force-dynamic';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const userId = await verifyAuthToken(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { message, history = [] } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const ragResult = await queryRAG(message, userId, { topK: 5 });
    const historyString = history
      .slice(-10)
      .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
      .join('\n');

    const systemPrompt = `You are CareerPilot, an AI career assistant. Use only CV-grounded facts.

CV CONTEXT:
${ragResult.contextString || 'No CV data available.'}

Rules:
1. Do not invent experiences or skills.
2. If info is missing, explicitly say so.
3. Give practical next steps.`;

    const fullPrompt = historyString
      ? `${systemPrompt}\n\nCONVERSATION HISTORY:\n${historyString}\n\nUser: ${message}`
      : `${systemPrompt}\n\nUser: ${message}`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(fullPrompt);
    const response = result.response.text();

    return NextResponse.json({
      response,
      ragChunks: ragResult.chunks.map((c) => ({
        id: c.id,
        section: c.section,
        content: c.content,
      })),
    });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}
