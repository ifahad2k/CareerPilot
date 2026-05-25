import { NextRequest } from 'next/server';
import { adminAuth } from './admin';

// ============================================================
// Firebase Auth — Server-side token verification
// ============================================================
// verifyAuthToken: used in API routes to authenticate requests.
// Reads the Authorization header, verifies via firebase-admin.
// ============================================================

/**
 * Verify Firebase Auth token from a request's Authorization header.
 * Returns the userId (uid) on success, null on failure.
 *
 * Usage in API routes:
 *   const userId = await verifyAuthToken(req);
 *   if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 */
export async function verifyAuthToken(req: NextRequest): Promise<string | null> {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;

    const token = authHeader.slice(7); // Strip "Bearer "
    if (!token) return null;

    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.uid;
  } catch (error) {
    console.error('[Auth] Token verification failed:', error);
    return null;
  }
}