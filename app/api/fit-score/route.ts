import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAuthToken } from '@/lib/firebase/auth';
import { calculateFitScore } from '@/lib/ai/fitScore';

export const dynamic = 'force-dynamic';

function normalizeSkills(skills: unknown): string[] {
  if (Array.isArray(skills)) {
    return skills.map((s) => String(s).trim()).filter(Boolean);
  }
  if (typeof skills === 'string') {
    return skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export async function POST(req: NextRequest) {
  const userId = await verifyAuthToken(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const jobTitle = String(body.jobTitle ?? 'Target Role');
    const jobDescription = String(body.jobDescription ?? '').trim();
    const jobRequirements = String(body.jobRequirements ?? '').trim();

    if (!jobDescription) {
      return NextResponse.json({ error: 'jobDescription is required' }, { status: 400 });
    }

    const cvDoc = await adminDb.collection('cvs').doc(userId).get();
    if (!cvDoc.exists) {
      return NextResponse.json({ error: 'CV not found. Please upload your CV first.' }, { status: 400 });
    }

    const parsedSections = cvDoc.data()?.parsedSections ?? {};
    const cvProfile = {
      skills: normalizeSkills(parsedSections.skills),
      experience: Array.isArray(parsedSections.experience)
        ? parsedSections.experience.join('\n')
        : String(parsedSections.experience ?? ''),
      education: Array.isArray(parsedSections.education)
        ? parsedSections.education.join('\n')
        : String(parsedSections.education ?? ''),
    };

    const fitScore = await calculateFitScore(cvProfile, {
      title: jobTitle,
      description: jobDescription,
      requirements: jobRequirements,
    });

    return NextResponse.json({ fitScore });
  } catch (error) {
    console.error('Fit score error:', error);
    return NextResponse.json({ error: 'Failed to calculate fit score' }, { status: 500 });
  }
}
