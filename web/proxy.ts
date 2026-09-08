import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/features/auth/constants";


const PUBLIC_ROUTES = ["/", "/login", "/register", "/verify-otp"];
const AUTH_ROUTES = ["/login", "/register", "/verify-otp"];

function isPublicSiteRoute(pathname: string) {
  return pathname.startsWith("/s/") && !pathname.includes("/dashboard");
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (hasSession && AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/hotels", request.url));
  }

  const isPublic = PUBLIC_ROUTES.includes(pathname) || isPublicSiteRoute(pathname);

  if (!hasSession && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {

  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
