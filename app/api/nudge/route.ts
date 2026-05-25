import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAuthToken } from '@/lib/firebase/auth';
import { queryRAG } from '@/lib/ai/rag';
import { PROMPTS } from '@/lib/ai/prompts';
import { withAI } from '@/lib/ai/withAI';

export const dynamic = 'force-dynamic';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function GET(req: NextRequest) {
  const userId = await verifyAuthToken(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const targetRole = String(userDoc.data()?.targetRole || 'your target role');
    const rag = await queryRAG('Give me one quick career action for today', userId, { topK: 5 });

    const prompt = PROMPTS.NUDGE(rag.contextString, targetRole);
    const aiResult = await withAI(
      async () => {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
      },
      'Action: Apply to one relevant role and tailor your CV summary for it.',
      'Nudge service temporarily unavailable'
    );

    return NextResponse.json({
      nudge: aiResult.data,
      warning: aiResult.error,
    });
  } catch (error) {
    console.error('Nudge generation error:', error);
    return NextResponse.json({ error: 'Failed to generate nudge' }, { status: 500 });
  }
}
