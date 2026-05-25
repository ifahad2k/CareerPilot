import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAuthToken } from '@/lib/firebase/auth';

// ============================================================
// API: Goals CRUD
// ============================================================
//
// Pillar 4 — Productivity & Progress Tracker
// - GET: Fetch user's goals with AI nudges
// - POST: Create new goal
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const userId = await verifyAuthToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const snapshot = await adminDb
      .collection('goals')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const goals = snapshot.docs.map((d: any) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() || d.data().createdAt,
    }));

    // Generate AI nudges based on goals
    const nudges = generateNudges(goals);

    return NextResponse.json({ goals, nudges });
  } catch (error) {
    console.error('GET /api/goals error:', error);
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await verifyAuthToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, category, dueDate } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const goalData = {
      userId,
      title,
      category: category || 'general',
      completed: false,
      dueDate: dueDate || null,
      createdAt: new Date(),
    };

    const docRef = await adminDb.collection('goals').add(goalData);

    return NextResponse.json({
      goal: {
        id: docRef.id,
        ...goalData,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('POST /api/goals error:', error);
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
  }
}

// ============================================================
// Helper: Generate AI Nudges
// ============================================================

function generateNudges(goals: any[]): any[] {
  const nudges: any[] = [];
  const pendingGoals = goals.filter((g: any) => !g.completed);
  const applyGoals = pendingGoals.filter((g: any) => g.category === 'apply');
  const overdueGoals = pendingGoals.filter((g: any) => g.dueDate && new Date(g.dueDate) < new Date());

  if (overdueGoals.length > 0) {
    nudges.push({
      id: 'overdue',
      type: 'reminder',
      message: `You have ${overdueGoals.length} overdue goal(s). Consider rescheduling or completing them.`,
      timestamp: new Date().toISOString(),
    });
  }

  if (applyGoals.length === 0 && goals.length > 3) {
    nudges.push({
      id: 'apply-tip',
      type: 'suggestion',
      message: 'Consider adding some job application goals to track your progress.',
      timestamp: new Date().toISOString(),
    });
  }

  const total = goals.length;
  const completed = goals.filter((g: any) => g.completed).length;
  if (total > 0 && completed / total >= 0.8) {
    nudges.push({
      id: 'celebrate',
      type: 'tip',
      message: "🎉 You're crushing your goals! Keep up the momentum.",
      timestamp: new Date().toISOString(),
    });
  }

  return nudges;
}
