// middleware.js
// Next.js Edge Middleware — runs before every request
// Handles route protection SERVER-SIDE (no JS needed client-side)
// This is a second layer of security on top of the client-side auth check in layout.jsx

import { NextResponse } from 'next/server';

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login'];

// Routes that should redirect to dashboard if already logged in
const AUTH_ONLY_ROUTES = ['/login'];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Read the access token from cookies
  // NOTE: We store the token in localStorage (client-side), not cookies.
  // Middleware runs on the Edge — it cannot read localStorage.
  // So this middleware does a simple check using a cookie we set on login.
  // See the loginSuccess flow update below for how we set the cookie.
  const tokenCookie = request.cookies.get('apnabot_token');
  const isLoggedIn  = !!tokenCookie?.value;

  // ── Unauthenticated user trying to access dashboard ──
  if (!isLoggedIn && !PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // ── Already logged in user trying to access login page ──
  if (isLoggedIn && AUTH_ONLY_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Only run middleware on these paths — excludes _next assets, static files, api
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
