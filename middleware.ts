import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware only handles redirects for routes that no longer exist.
// Auth protection is handled client-side via useAuth() in each page,
// because the Supabase JS client stores sessions in localStorage
// which is not accessible from middleware.

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect old dashboard route to profiles
  if (pathname === '/dashboard') {
    return NextResponse.redirect(new URL('/profiles', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard'],
};
