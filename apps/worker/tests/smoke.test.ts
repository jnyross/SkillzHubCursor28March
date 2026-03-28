import { describe, expect, it } from "vitest";

import { getWorkerConfig } from "../src/config";

describe("worker scaffold", () => {
  it("loads worker config defaults", () => {
    const config = getWorkerConfig();

    expect(config.port).toBeGreaterThan(0);
    expect(config.runtimeEnv.claudeBinary).toBeTruthy();
    expect(config.runtimeEnv.s3Bucket).toBeTruthy();
  });
});
