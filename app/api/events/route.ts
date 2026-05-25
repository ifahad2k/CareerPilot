import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAuthToken } from '@/lib/firebase/auth';

// ============================================================
// API: Events CRUD
// ============================================================
//
// Pillar 4 — Productivity & Progress Tracker
// - GET: Fetch user's events
// - POST: Create new event
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const userId = await verifyAuthToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const snapshot = await adminDb
      .collection('events')
      .where('userId', '==', userId)
      .orderBy('date', 'asc')
      .get();

    const events = snapshot.docs.map((d: any) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() || d.data().createdAt,
    }));

    return NextResponse.json({ events });
  } catch (error) {
    console.error('GET /api/events error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await verifyAuthToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, date, time, type, relatedAppId } = body;

    if (!title || !date) {
      return NextResponse.json({ error: 'Title and date are required' }, { status: 400 });
    }

    const eventData = {
      userId,
      title,
      date,
      time: time || null,
      type: type || 'reminder',
      relatedAppId: relatedAppId || null,
      createdAt: new Date(),
    };

    const docRef = await adminDb.collection('events').add(eventData);

    return NextResponse.json({
      event: {
        id: docRef.id,
        ...eventData,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('POST /api/events error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
