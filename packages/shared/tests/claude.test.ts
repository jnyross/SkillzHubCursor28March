import { describe, expect, it } from "vitest";
import { describePhaseZeroReadiness } from "../src/index";

describe("describePhaseZeroReadiness", () => {
  it("reports the shared package as bootstrapped", () => {
    expect(describePhaseZeroReadiness()).toEqual({
      package: "@skill-builder/shared",
      status: "bootstrapped",
    });
  });
});
