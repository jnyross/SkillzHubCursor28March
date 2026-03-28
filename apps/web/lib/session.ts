import { cookies } from "next/headers";

import {
  authCookieName,
  clearSessionCookieOptions,
  createSessionCookieValue,
  getSessionCookieMaxAgeSeconds,
  sessionCookieOptions,
  verifySessionCookieValue,
} from "./auth";

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(authCookieName);

  if (!cookie) {
    return null;
  }

  const payload = verifySessionCookieValue(cookie.value);
  return payload;
}

export async function setAuthenticatedSession() {
  const cookieStore = await cookies();

  cookieStore.set(
    authCookieName,
    createSessionCookieValue(),
    sessionCookieOptions(getSessionCookieMaxAgeSeconds()),
  );
}

export async function clearAuthenticatedSession() {
  const cookieStore = await cookies();
  cookieStore.set(authCookieName, "", clearSessionCookieOptions());
}
