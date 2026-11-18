import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  // Function to decode JWT-like payload from token
  const getPayload = (tok?: string) => {
    if (!tok || !tok.includes('.')) return null;
    try {
      const [payloadPart] = tok.split('.');
      const json = atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json);
    } catch {
      return null;
    }
  };

  const payload = getPayload(token);

  // Protected Admin Routes: /admin and all subpaths
  if (pathname.startsWith('/admin')) {
    if (!payload || payload.role !== 'admin') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('error', 'admin_required');
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protected Captain/Driver Routes: /driver and all subpaths
  if (pathname.startsWith('/driver')) {
    if (!payload || (payload.role !== 'captain' && payload.role !== 'admin')) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('error', 'captain_required');
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();

  // Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/driver/:path*'],
};
