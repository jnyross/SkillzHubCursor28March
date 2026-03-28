import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { sharedEnv } from "@skill-builder/shared";

export const authCookieName = "skill_builder_session";
export const SESSION_COOKIE_NAME = authCookieName;

const SESSION_COOKIE_PATH = "/";
const DEFAULT_SESSION_MARKER = "local-authenticated";
const DEFAULT_USER = "local-admin";

export interface AuthSession {
  user: string;
}

export type AuthGuardResult =
  | {
      ok: true;
      session: AuthSession;
    }
  | {
      ok: false;
      response: NextResponse;
    };

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function getExpectedLocalUser() {
  return sharedEnv.APP_LOCAL_USER ?? DEFAULT_USER;
}

function getConfiguredPasswordHash() {
  const rawPassword = sharedEnv.APP_LOCAL_PASSWORD?.trim();
  if (!rawPassword) {
    return null;
  }

  return sha256(rawPassword);
}

export function isPasswordConfigured() {
  return Boolean(getConfiguredPasswordHash());
}

export async function verifyPassword(password: string) {
  const expectedHash = getConfiguredPasswordHash();
  if (!expectedHash) {
    return false;
  }

  const providedHash = sha256(password);
  const expectedBuffer = Buffer.from(expectedHash);
  const providedBuffer = Buffer.from(providedHash);

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
}

export const verifyLocalPassword = verifyPassword;

function getSessionSecret() {
  return sharedEnv.APP_SESSION_SECRET ?? "development-session-secret";
}

export function getSessionCookieMaxAgeSeconds() {
  return 60 * 60 * 12;
}

export function createSessionCookieValue(user = getExpectedLocalUser()) {
  const payload = `${DEFAULT_SESSION_MARKER}:${user}`;
  const signature = sha256(`${payload}:${getSessionSecret()}`).slice(0, 32);
  return `${payload}:${signature}`;
}

export function verifySessionCookieValue(value: string | undefined): AuthSession | null {
  if (!value) {
    return null;
  }

  const [marker, user, signature] = value.split(":");
  if (!marker || !user || !signature) {
    return null;
  }

  const payload = `${marker}:${user}`;
  const expectedSignature = sha256(`${payload}:${getSessionSecret()}`).slice(0, 32);
  const expectedBuffer = Buffer.from(expectedSignature);
  const actualBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== actualBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(expectedBuffer, actualBuffer)) {
    return null;
  }

  if (marker !== DEFAULT_SESSION_MARKER) {
    return null;
  }

  return { user };
}

export function isAuthenticatedSessionCookie(value: string | undefined) {
  return Boolean(verifySessionCookieValue(value));
}

export function hasValidSessionCookie(value: string | undefined) {
  return isAuthenticatedSessionCookie(value);
}

export function sessionCookieOptions(maxAge = getSessionCookieMaxAgeSeconds()) {
  return {
    path: SESSION_COOKIE_PATH,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: false,
    maxAge,
  };
}

export function clearSessionCookieOptions() {
  return {
    ...sessionCookieOptions(0),
    expires: new Date(0),
  };
}

export function createSessionCookie(user = getExpectedLocalUser()) {
  return {
    name: authCookieName,
    value: createSessionCookieValue(user),
    ...sessionCookieOptions(),
  };
}

export async function getSessionFromCookies(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  return verifySessionCookieValue(cookieStore.get(authCookieName)?.value);
}

export async function getSessionFromCookieStore(): Promise<AuthSession | null> {
  return getSessionFromCookies();
}

export async function requireAuthenticatedSession(): Promise<AuthGuardResult> {
  const session = await getSessionFromCookies();

  if (!session) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          ok: false,
          error: "UNAUTHORIZED",
        },
        { status: 401 },
      ),
    };
  }

  return {
    ok: true,
    session,
  };
}

export async function requireAuthenticatedRequest() {
  return requireAuthenticatedSession();
}

export function isPublicPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/api/auth/login" ||
    pathname === "/api/auth/logout" ||
    pathname === "/api/auth/session" ||
    pathname === "/api/health" ||
    pathname === "/api/claude/preflight"
  );
}
