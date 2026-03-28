import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const queueNames = vi.hoisted(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  createQueue: vi.fn(),
}));

vi.mock("pg-boss", () => ({
  PgBoss: vi.fn().mockImplementation(() => queueNames),
}));

describe("worker runtime scaffolding", () => {
  const env = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...env,
      DATABASE_URL: "postgresql://skill_builder:skill_builder@127.0.0.1:5432/skill_builder",
      S3_ENDPOINT: "http://127.0.0.1:9000",
      S3_BUCKET: "skill-builder-artifacts",
      S3_ACCESS_KEY_ID: "minio",
      S3_SECRET_ACCESS_KEY: "minio123",
      CLAUDE_CODE_BIN: "claude",
      CLAUDE_CODE_MODEL: "claude-sonnet-4-5",
      APP_SESSION_SECRET: "development-session-secret",
      APP_LOCAL_PASSWORD: "replace-me",
    };
  });

  afterEach(() => {
    process.env = env;
  });

  it("builds the worker config from environment", async () => {
    const { getWorkerConfig } = await import("../src/config");
    const config = getWorkerConfig();

    expect(config.port).toBe(3001);
    expect(config.queue.launchQueue).toBe("iteration.launch");
    expect(config.runtimeEnv.s3Bucket).toBe("skill-builder-artifacts");
    expect(config.runtimeEnv.claudeModel).toBe("claude-sonnet-4-5");
  });

  it("creates a workdir in the configured temp root", async () => {
    const { createRunWorkdir, cleanupRunWorkdir } = await import("../src/runner/workdir");
    const { getWorkerConfig } = await import("../src/config");

    const workdir = await createRunWorkdir(getWorkerConfig().run.tmpRoot);
    expect(workdir.path).toContain("skill-builder-run-");

    await cleanupRunWorkdir(workdir.path);
  });
});
