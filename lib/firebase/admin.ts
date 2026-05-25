import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// ============================================================
// Firebase Admin SDK — Server-side only
// ============================================================
// This module must NEVER be imported in client components.
// Uses getApps().length guard to prevent re-initialization.
// Exports both Firestore (adminDb) and Auth (adminAuth).
// ============================================================

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const adminDb = getFirestore();
const adminAuth = getAuth();

export { adminDb, adminAuth };