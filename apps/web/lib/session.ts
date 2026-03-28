import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  authCookieName,
  clearSessionCookieOptions,
  createSessionCookie,
  type AuthSession,
  verifySessionCookieValue,
} from "./auth";

export async function getCurrentSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(authCookieName);

  if (!cookie) {
    return null;
  }

  return verifySessionCookieValue(cookie.value);
}

export async function getSession(): Promise<{
  authenticated: boolean;
  user: string | null;
}> {
  const session = await getCurrentSession();

  return {
    authenticated: Boolean(session),
    user: session?.user ?? null,
  };
}

export async function getSessionFromCookies(): Promise<AuthSession | null> {
  return getCurrentSession();
}

export function attachAuthenticatedSession(response: NextResponse, user?: string) {
  response.cookies.set(createSessionCookie(user));
  return response;
}

export function clearAuthSession(response: NextResponse) {
  response.cookies.set(authCookieName, "", clearSessionCookieOptions());
  return response;
}
