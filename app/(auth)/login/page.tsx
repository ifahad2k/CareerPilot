'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

// ============================================================
// Page: /login — Split-screen login
// ============================================================

/** Map Firebase error codes to user-friendly messages */
function getFriendlyError(code: string): string {
  switch (code) {
    case 'auth/invalid-credential':
      return 'Incorrect email or password';
    case 'auth/user-not-found':
      return 'Incorrect email or password';
    case 'auth/wrong-password':
      return 'Incorrect email or password';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

const features = [
  'CV-grounded AI assistant',
  'Smart job matching with fit scores',
  'Application tracker & goals',
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      // Get ID token and set it as a cookie for middleware
      const token = await credential.user.getIdToken();
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

      {/* ── RIGHT HALF — Login form ── */}
      <div className="flex-1 bg-white flex flex-col justify-center items-center px-8 md:px-16 min-h-screen">
        <div className="max-w-sm w-full mx-auto">
          {/* Mobile-only logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-6 md:mb-8">
              <span className="text-2xl">🚀</span>
              <span className="text-xl font-bold text-blue-600">CareerPilot</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="text-sm text-slate-500 mt-1">Sign in to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Email
              </label>
              <input
                id="login-email"
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
                htmlFor="login-password"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Password
              </label>
              <input
                id="login-password"
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
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Link to signup */}
          <p className="text-sm text-slate-600 text-center mt-6">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
