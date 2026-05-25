import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { verifyAuthToken } from '@/lib/firebase/auth';
import { queryRAG } from '@/lib/ai/rag';
import { PROMPTS } from '@/lib/ai/prompts';

export const dynamic = 'force-dynamic';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function buildFallbackRoadmap(targetRole: string, durationWeeks: number) {
  return {
    targetRole,
    totalWeeks: durationWeeks,
    weeks: Array.from({ length: durationWeeks }, (_, idx) => ({
      week: idx + 1,
      theme: `Week ${idx + 1} - Core ${targetRole} Foundations`,
      tasks: [
        `Study one core ${targetRole} concept`,
        'Complete one hands-on practice exercise',
        'Document progress in your notes/portfolio',
      ],
      resources: [
        { title: 'freeCodeCamp', url: 'https://www.freecodecamp.org/', type: 'course' },
      ],
      milestone: `Complete weekly learning sprint ${idx + 1}`,
    })),
  };
}

export async function POST(req: NextRequest) {
  const userId = await verifyAuthToken(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const targetRole = String(body.targetRole ?? '').trim();
    const durationWeeks = Math.max(1, Math.min(24, Number(body.durationWeeks ?? 8)));

    if (!targetRole) {
      return NextResponse.json({ error: 'targetRole is required' }, { status: 400 });
    }

    const rag = await queryRAG(`Roadmap for ${targetRole}`, userId, { topK: 8 });
    const prompt = PROMPTS.ROADMAP(rag.contextString, targetRole, durationWeeks);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);

    let roadmap: unknown;
    try {
      const responseText = result.response.text().replace(/```json|```/g, '').trim();
      roadmap = JSON.parse(responseText);
    } catch {
      roadmap = buildFallbackRoadmap(targetRole, durationWeeks);
    }

    return NextResponse.json({ roadmap });
  } catch (error) {
    console.error('Roadmap generation error:', error);
    return NextResponse.json({ error: 'Failed to generate roadmap' }, { status: 500 });
  }
}
