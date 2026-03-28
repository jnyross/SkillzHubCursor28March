import { describe, expect, it } from "vitest";

import { phaseZeroUiReady } from "../src/index";

describe("ui package bootstrap", () => {
  it("exposes a phase zero readiness marker", () => {
    expect(phaseZeroUiReady).toBe(true);
  });
});
