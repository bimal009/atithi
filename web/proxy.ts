import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/features/auth/constants";

/**
 * Optimistic auth routing only — it checks that a session cookie exists, not
 * that it is valid. Proxy runs on every request, so verifying the token here
 * would mean an API round trip per navigation. The real check lives in the
 * server-side DAL (features/auth/server/session.ts), which every protected
 * page already goes through.
 */
const PUBLIC_ROUTES = ["/", "/login", "/verify-otp"];
const AUTH_ROUTES = ["/login", "/verify-otp"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (hasSession && AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/hotels", request.url));
  }

  const isPublic = PUBLIC_ROUTES.includes(pathname);

  if (!hasSession && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Everything except Next internals, static assets and image files. Without
  // this the redirect above would also swallow CSS, JS and images.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
