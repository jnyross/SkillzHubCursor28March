import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentSession = vi.fn();

vi.mock("../lib/session", () => ({
  getCurrentSession: (...args: unknown[]) => getCurrentSession(...args),
}));

import { createSessionCookie, verifyPassword, verifySessionCookieValue } from "../lib/auth";
import { GET as getSession } from "../app/api/auth/session/route";

describe("auth helpers", () => {
  beforeEach(() => {
    getCurrentSession.mockReset();
    getCurrentSession.mockResolvedValue(null);
  });

  it("accepts the configured local password", async () => {
    process.env.APP_LOCAL_PASSWORD = "secret-pass";

    expect(await verifyPassword("secret-pass")).toBe(true);
    expect(await verifyPassword("wrong-pass")).toBe(false);
  });

  it("creates a signed session cookie payload", async () => {
    process.env.APP_SESSION_SECRET = "super-secret-phase-two-key";
    process.env.APP_LOCAL_USER = "local-admin";

    const cookie = createSessionCookie("local-admin");

    expect(cookie.name).toBe("skill_builder_session");
    expect(cookie.value).toBeTruthy();
    expect(cookie.httpOnly).toBe(true);
    expect(verifySessionCookieValue(cookie.value)).toEqual({
      user: "local-admin",
    });
  });

  it("returns an unauthenticated session payload by default", async () => {
    const response = await getSession();
    const body = await response.json();

    expect(body).toEqual({
      ok: true,
      authenticated: false,
      session: null,
    });
  });
});
