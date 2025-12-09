/**
 * Next.js Middleware for Authentication
 *
 * Protects routes by checking Supabase session via cookies.
 * Runs on Edge Runtime for optimal performance.
 *
 * Protected Routes:
 * - /dashboard and all sub-routes
 * - Future protected routes can be added to matcher
 *
 * Authentication Flow:
 * 1. Middleware checks for valid session in cookies
 * 2. If no session, redirect to /login with callbackUrl
 * 3. If session exists, allow request to proceed
 * 4. Automatically refreshes expired tokens via @supabase/ssr
 *
 * Note: Uses @supabase/ssr for automatic token refresh and cookie management
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  // DO NOT REMOVE - this is critical for automatic token refresh
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes logic
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login');

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users away from login page
  if (isAuthRoute && user) {
    const callbackUrl =
      request.nextUrl.searchParams.get('callbackUrl') || '/dashboard';
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = callbackUrl;
    redirectUrl.searchParams.delete('callbackUrl');
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - Public assets (svg, png, jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
