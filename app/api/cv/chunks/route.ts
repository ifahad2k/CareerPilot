// ============================================================
// CareerPilot — CV Chunks API Route
// ============================================================
// 
// GET /api/cv/chunks
// Returns user's CV chunks from Firestore for RAG queries
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAuthToken } from '@/lib/firebase/auth';

/**
 * Get CV chunks for authenticated user
 * GET /api/cv/chunks
 */
export async function GET(req: NextRequest) {
  const userId = await verifyAuthToken(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const chunksRef = adminDb
      .collection('cvChunks')
      .doc(userId)
      .collection('chunks');
    
    const snapshot = await chunksRef.get();
    
    const chunks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ chunks });
  } catch (error) {
    console.error('Failed to fetch CV chunks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CV chunks' },
      { status: 500 }
    );
  }
}
