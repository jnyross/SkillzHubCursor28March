import { describe, expect, it } from "vitest";

import { readWorkerConfig } from "../src/config";

describe("worker scaffold", () => {
  it("loads worker config defaults", () => {
    const config = readWorkerConfig();

    expect(config.port).toBeGreaterThan(0);
    expect(config.runtimeEnv.CLAUDE_CODE_BIN).toBeTruthy();
    expect(config.runtimeEnv.S3_BUCKET).toBeTruthy();
  });
});
