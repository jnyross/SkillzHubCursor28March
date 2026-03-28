import { describe, expect, it } from "vitest";

import { createSessionCookie, verifyPassword } from "../lib/auth";
import { GET as getSession } from "../app/api/auth/session/route";

describe("auth helpers", () => {
  it("accepts the configured local password", async () => {
    process.env.APP_LOCAL_PASSWORD = "secret-pass";

    await expect(verifyPassword("secret-pass")).resolves.toBe(true);
    await expect(verifyPassword("wrong-pass")).resolves.toBe(false);
  });

  it("creates a signed session cookie payload", async () => {
    process.env.APP_SESSION_SECRET = "super-secret-phase-two-key";
    process.env.APP_LOCAL_USER = "local-admin";

    const cookie = await createSessionCookie("local-admin");

    expect(cookie.name).toBe("skill_builder_session");
    expect(cookie.value).toBeTruthy();
    expect(cookie.httpOnly).toBe(true);
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
