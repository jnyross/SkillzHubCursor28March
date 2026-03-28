import { describe, expect, it } from "vitest";

import { GET } from "../app/api/health/route";
import { runClaudePreflight } from "../lib/claude-preflight";

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
