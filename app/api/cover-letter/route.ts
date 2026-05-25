import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { verifyAuthToken } from '@/lib/firebase/auth';
import { queryRAG } from '@/lib/ai/rag';
import { PROMPTS } from '@/lib/ai/prompts';

export const dynamic = 'force-dynamic';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const userId = await verifyAuthToken(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const company = String(body.company ?? '').trim();
    const role = String(body.role ?? '').trim();
    const jobDescription = String(body.jobDescription ?? '').trim();

    if (!company || !role || !jobDescription) {
      return NextResponse.json(
        { error: 'company, role, and jobDescription are required' },
        { status: 400 }
      );
    }

    const rag = await queryRAG(`${role} ${jobDescription}`, userId, { topK: 8 });
    const prompt = PROMPTS.COVER_LETTER(rag.contextString, jobDescription, company, role);

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const coverLetter = result.response.text().trim();

    return NextResponse.json({
      coverLetter,
      sources: rag.chunks.map((c) => ({ id: c.id, section: c.section })),
    });
  } catch (error) {
    console.error('Cover letter generation error:', error);
    return NextResponse.json({ error: 'Failed to generate cover letter' }, { status: 500 });
  }
}
