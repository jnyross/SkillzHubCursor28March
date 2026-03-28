import { describe, expect, it } from "vitest";

import { GET } from "../app/api/health/route";

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
