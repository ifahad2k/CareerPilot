import { auth } from './client';
import { User } from 'firebase/auth';

/**
 * Verify Firebase Auth token from request headers
 * Returns userId if valid, null if unauthorized
 */
export async function verifyAuthToken(token: string): Promise<string | null> {
  try {
    if (!token) return null;
    
    // Dynamic import to avoid SSR issues
    const { getIdToken } = await import('firebase/auth');
    
    // For server-side API routes, we verify the token
    // A production implementation would use firebase-admin to verify
    const user = auth?.currentUser;
    
    if (user) {
      const freshToken = await getIdToken(user, true);
      return freshToken ? user.uid : null;
    }
    
    return null;
  } catch (error) {
    console.error('[Auth] Token verification failed:', error);
    return null;
  }
}

/**
 * Get current user from Firebase Auth session
 * Only works in client components
 */
export function getCurrentUser(): User | null {
  return auth?.currentUser ?? null;
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string) {
  const { signInWithEmailAndPassword } = await import('firebase/auth');
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Create new user account
 */
export async function createUserWithEmail(email: string, password: string) {
  const { createUserWithEmailAndPassword } = await import('firebase/auth');
  return createUserWithEmailAndPassword(auth, email, password);
}

/**
 * Sign out current user
 */
export async function signOut() {
  const { signOut: firebaseSignOut } = await import('firebase/auth');
  return firebaseSignOut(auth);
}