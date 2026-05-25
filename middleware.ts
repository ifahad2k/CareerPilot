import { NextResponse, NextRequest } from 'next/server';

// ============================================================
// Middleware — Route protection via fb-token cookie
// ============================================================
// - Unauthenticated users hitting /dashboard/* → redirect to /login
// - Authenticated users hitting /login or /signup → redirect to /dashboard
// - Cookie is set client-side after Firebase Auth login/signup
// ============================================================

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('fb-token')?.value;

  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isProtectedRoute = pathname.startsWith('/dashboard');

  // Unauthenticated → redirect away from protected routes
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated → redirect away from auth pages
  if (isAuthPage && token) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
};
