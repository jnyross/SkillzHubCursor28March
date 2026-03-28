import { describe, expect, it } from "vitest";
import { databaseHealth } from "../src/index";

describe("packages/db smoke", () => {
  it("exports the phase 0 placeholder health", () => {
    expect(databaseHealth.status).toBe("pending");
  });
});
