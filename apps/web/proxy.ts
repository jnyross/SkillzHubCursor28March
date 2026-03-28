import { NextResponse, type NextRequest } from "next/server";

import {
  SESSION_COOKIE_NAME,
  isAuthenticatedSessionCookie,
  isPublicPath,
} from "./lib/auth";

const DASHBOARD_PATHS = ["/projects"];

function isDashboardPath(pathname: string) {
  return DASHBOARD_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname) || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const authenticated = isAuthenticatedSessionCookie(sessionCookie);

  if (!authenticated && isDashboardPath(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (authenticated && pathname === "/login") {
    return NextResponse.redirect(new URL("/projects", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
