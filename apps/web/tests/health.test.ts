import { describe, expect, it } from "vitest";

import { GET } from "../app/api/health/route";
import { runClaudePreflight } from "../lib/claude-preflight";
import {
  createSessionToken,
  hashPassword,
  verifyPassword,
} from "../lib/auth";

describe("GET /api/health", () => {
  it("returns the phase 0 web health payload", async () => {
    const response = await GET();
    const body = await response.json();

    expect(body).toEqual({
      ok: true,
      service: "web",
      phase: "phase-0",
    });
  });
});

describe("runClaudePreflight", () => {
  it("reports the installed Claude binary path", async () => {
    const result = await runClaudePreflight();

    expect(result.binaryPath).toBeTruthy();
    expect(["ok", "not_authenticated", "missing_binary", "error"]).toContain(result.status);
  });
});

describe("auth helpers", () => {
  it("hashes and verifies passwords deterministically", async () => {
    const hash = await hashPassword("secret-password");

    await expect(verifyPassword("secret-password", hash)).resolves.toBe(true);
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });

  it("creates a session token", async () => {
    const token = await createSessionToken("local-admin");

    expect(token).toMatch(/^session_[a-zA-Z0-9_-]+$/);
  });
});
