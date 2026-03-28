import { createHash, timingSafeEqual } from "node:crypto";

import { sharedEnv } from "@skill-builder/shared";

export const SESSION_COOKIE_NAME = "skill_builder_session";

const DEFAULT_SESSION_VALUE = "local-authenticated";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function getExpectedLocalUser() {
  return sharedEnv.APP_LOCAL_USER ?? "local-admin";
}

function getConfiguredPasswordHash() {
  const explicitHash = sharedEnv.APP_LOCAL_PASSWORD_SHA256?.trim();
  if (explicitHash) {
    return explicitHash;
  }

  const rawPassword = sharedEnv.APP_LOCAL_PASSWORD?.trim();
  if (!rawPassword) {
    return null;
  }

  return sha256(rawPassword);
}

export function isPasswordConfigured() {
  return Boolean(getConfiguredPasswordHash());
}

export function verifyLocalPassword(password: string) {
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

export function getSessionCookieValue() {
  const secret = sharedEnv.APP_SESSION_SECRET ?? "development-session-secret";
  return `${DEFAULT_SESSION_VALUE}:${sha256(secret).slice(0, 16)}`;
}

export function isAuthenticatedSessionCookie(value: string | undefined) {
  return value === getSessionCookieValue();
}
