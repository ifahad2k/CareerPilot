import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAuthToken } from '@/lib/firebase/auth';
import { ApplicationStatus } from '@/types';

const VALID_STATUS: ApplicationStatus[] = ['applied', 'interviewing', 'offer', 'rejected'];

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = await verifyAuthToken(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = params;
    const body = await req.json();
    const appRef = adminDb.collection('applications').doc(userId).collection('items').doc(id);
    const appDoc = await appRef.get();

    if (!appDoc.exists) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (typeof body.status !== 'undefined') {
      if (!VALID_STATUS.includes(body.status as ApplicationStatus)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      updates.status = body.status;
    }

    if (typeof body.notes !== 'undefined') {
      updates.notes = body.notes || null;
    }

    if (typeof body.fit_score !== 'undefined') {
      const score = Number(body.fit_score);
      updates.fit_score = Number.isNaN(score) ? null : score;
    }

    await appRef.update(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update application:', error);
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = await verifyAuthToken(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = params;
    const appRef = adminDb.collection('applications').doc(userId).collection('items').doc(id);
    const appDoc = await appRef.get();

    if (!appDoc.exists) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    await appRef.delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete application:', error);
    return NextResponse.json({ error: 'Failed to delete application' }, { status: 500 });
  }
}
