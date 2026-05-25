// ============================================================
// CareerPilot - Stats API Route
// ============================================================
//
// GET /api/stats -> Dashboard statistics
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAuthToken } from '@/lib/firebase/auth';
import { Application } from '@/types';

export const dynamic = 'force-dynamic';

interface DashboardActivity {
  text: string;
  time: string;
}

function formatRelativeTime(dateInput: string): string {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return 'Recently';

  const now = Date.now();
  const diffMs = now - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return 'Just now';
  if (diffMs < hour) return `${Math.floor(diffMs / minute)} min ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)} hour${Math.floor(diffMs / hour) > 1 ? 's' : ''} ago`;
  if (diffMs < 2 * day) return 'Yesterday';
  if (diffMs < 7 * day) return `${Math.floor(diffMs / day)} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function toDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function calculateStreak(applications: Application[]): number {
  if (applications.length === 0) return 0;

  const daySet = new Set(
    applications
      .map((app) => new Date(app.applied_at))
      .filter((d) => !Number.isNaN(d.getTime()))
      .map((d) => toDayKey(d))
  );

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (daySet.has(toDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export async function GET(req: NextRequest) {
  const userId = await verifyAuthToken(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const appsRef = adminDb
      .collection('applications')
      .doc(userId)
      .collection('items');

    const snapshot = await appsRef.get();
    const applications: Application[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        user_id: data.user_id,
        role: data.role,
        company: data.company,
        location: data.location ?? null,
        salary_range: data.salary_range ?? null,
        job_url: data.job_url ?? null,
        status: data.status,
        applied_at: data.applied_at,
        notes: data.notes ?? null,
        fit_score: typeof data.fit_score === 'number' ? data.fit_score : null,
        created_at: data.created_at,
        updated_at: data.updated_at,
      } as Application;
    });

    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 6);

    const totalApplications = applications.length;
    const applicationsThisWeek = applications.filter((app) => {
      const appliedAt = new Date(app.applied_at);
      return !Number.isNaN(appliedAt.getTime()) && appliedAt >= weekAgo;
    }).length;

    const interviewing = applications.filter((app) => app.status === 'interviewing').length;
    const offers = applications.filter((app) => app.status === 'offer').length;
    const rejected = applications.filter((app) => app.status === 'rejected').length;
    const applied = applications.filter((app) => app.status === 'applied').length;

    const fitScores = applications
      .map((app) => app.fit_score)
      .filter((score): score is number => typeof score === 'number' && !Number.isNaN(score));
    const avgFitScore = fitScores.length
      ? Math.round(fitScores.reduce((sum, score) => sum + score, 0) / fitScores.length)
      : 0;

    const streak = calculateStreak(applications);

    const recentActivity: DashboardActivity[] = [...applications]
      .sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime())
      .slice(0, 3)
      .map((app) => {
        const statusText =
          app.status === 'interviewing'
            ? 'Interview in progress'
            : app.status === 'offer'
              ? 'Offer received'
              : app.status === 'rejected'
                ? 'Application rejected'
                : 'Applied';

        return {
          text: `${statusText}: ${app.role} at ${app.company}`,
          time: formatRelativeTime(app.applied_at),
        };
      });

    return NextResponse.json({
      applicationsThisWeek,
      totalApplications,
      interviewing,
      offers,
      rejected,
      applied,
      avgFitScore,
      streak,
      recentActivity,
    });
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
