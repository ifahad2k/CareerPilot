// ============================================================
// CareerPilot — Applications API Route
// ============================================================
//
// CRUD operations for job applications
// Stores in Firestore: applications/{userId}/items/{applicationId}
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAuthToken } from '@/lib/firebase/auth';
import { Application, ApplicationStatus } from '@/types';

/**
 * Get all applications for user
 * GET /api/applications
 */
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
    
    const snapshot = await appsRef.orderBy('applied_at', 'desc').get();
    
    const applications: Application[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        user_id: data.user_id,
        role: data.role,
        company: data.company,
        location: data.location,
        salary_range: data.salary_range,
        job_url: data.job_url,
        status: data.status,
        applied_at: data.applied_at,
        notes: data.notes,
        fit_score: data.fit_score,
        created_at: data.created_at,
        updated_at: data.updated_at,
      } as Application;
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Failed to fetch applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

/**
 * Create new application
 * POST /api/applications
 */
export async function POST(req: NextRequest) {
  const userId = await verifyAuthToken(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { role, company, location, salary_range, job_url, status = 'applied', notes, fit_score } = body;

    if (!role || !company) {
      return NextResponse.json(
        { error: 'Role and company are required' },
        { status: 400 }
      );
    }

    const appsRef = adminDb
      .collection('applications')
      .doc(userId)
      .collection('items');

    const now = new Date().toISOString();
    const newApp = {
      user_id: userId,
      role,
      company,
      location: location || null,
      salary_range: salary_range || null,
      job_url: job_url || null,
      status: status as ApplicationStatus,
      applied_at: now,
      notes: notes || null,
      fit_score: fit_score || null,
      created_at: now,
      updated_at: now,
    };

    const docRef = await appsRef.add(newApp);

    return NextResponse.json({
      application: { id: docRef.id, ...newApp },
    });
  } catch (error) {
    console.error('Failed to create application:', error);
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    );
  }
}