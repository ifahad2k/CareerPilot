'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

// ============================================================
// Page: /signup — Split-screen signup
// ============================================================

/** Map Firebase error codes to user-friendly messages */
function getFriendlyError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters';
    case 'auth/invalid-email':
      return 'Please enter a valid email address';
    default:
      return `Error: ${code} - Something went wrong.`;
  }
}

const features = [
  'CV-grounded AI assistant',
  'Smart job matching with fit scores',
  'Application tracker & goals',
];

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Create Firebase Auth user
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const user = credential.user;

      // 2. Set display name
      await updateProfile(user, { displayName: fullName });

      // 3. Create Firestore user document
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: fullName,
        email: user.email,
        createdAt: serverTimestamp(),
        cvUploaded: false,
        targetRole: '',
        targetLocation: '',
      });

      // 4. Get ID token and set it as a cookie for middleware
      const token = await user.getIdToken();
      document.cookie = `fb-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

      router.push('/dashboard');
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      setError(getFriendlyError(firebaseError.code ?? ''));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* ── LEFT HALF — Brand panel (hidden on mobile) ── */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 h-screen flex-col justify-center items-center px-12">
        <div className="max-w-md text-center">
          {/* Logo */}
          <span className="text-6xl">🚀</span>
          <h1 className="text-4xl font-bold text-white mt-4">CareerPilot</h1>
          <p className="text-xl text-blue-200 mt-3">
            Your AI-powered career co-pilot
          </p>

          {/* Feature list */}
          <div className="mt-10 space-y-4">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-3 justify-center">
                <CheckCircle2 className="text-green-400 w-5 h-5 flex-shrink-0" />
                <span className="text-blue-100 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT HALF — Signup form ── */}
      <div className="flex-1 bg-white flex flex-col justify-center items-center px-8 md:px-16 min-h-screen">
        <div className="max-w-sm w-full mx-auto">
          {/* Mobile-only logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-6 md:mb-8">
              <span className="text-2xl">🚀</span>
              <span className="text-xl font-bold text-blue-600">CareerPilot</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Create your account</h2>
            <p className="text-sm text-slate-500 mt-1">Start your career journey</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="signup-name"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Full Name
              </label>
              <input
                id="signup-name"
                type="text"
                required
                placeholder="Alex Chen"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 placeholder:text-slate-400 transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="signup-email"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 placeholder:text-slate-400 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="signup-password"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 placeholder:text-slate-400 transition-colors"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="text-red-500 w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  Creating account…
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Link to login */}
          <p className="text-sm text-slate-600 text-center mt-6">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
