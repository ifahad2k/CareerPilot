import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

// ============================================================
// API: Events - PATCH/DELETE by ID
// ============================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    await adminDb.collection('events').doc(id).update(body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH /api/events/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await adminDb.collection('events').doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/events/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}