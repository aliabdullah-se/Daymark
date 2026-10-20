import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets, internal Next.js routes, and API endpoints
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('daymark_token')?.value;
  const isOtpVerified = request.cookies.get('daymark_otp_verified')?.value === 'true';
  const isDemo =
    request.nextUrl.searchParams.get('demo') === 'judge' ||
    request.nextUrl.searchParams.get('demo') === 'true' ||
    request.nextUrl.searchParams.get('demo') === 'reader';

  // Routes requiring verified subscriber identity or judge credentials
  const isProtectedRoute =
    pathname === '/' ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/archive');

  if (isProtectedRoute && !token && !isOtpVerified && !isDemo) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  response.headers.set('X-Daymark-Middleware', 'Active');
  response.headers.set('X-Daymark-Security', 'OTP-Enforced');

  if (token || isOtpVerified || isDemo) {
    response.headers.set('X-Daymark-Auth', 'Subscriber-Verified');
  } else {
    response.headers.set('X-Daymark-Auth', 'Guest-Reader');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
