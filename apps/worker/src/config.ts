import { z } from "zod";

import { sharedEnv } from "@skill-builder/shared";

const workerEnvSchema = z.object({
  WORKER_PORT: z.coerce.number().int().positive().default(3001),
  WORKER_CONCURRENCY: z.coerce.number().int().positive().default(2),
  WORKER_TMP_ROOT: z.string().min(1).default("/workspace/.data/worker-runs"),
  PG_BOSS_SCHEMA: z.string().min(1).default("pgboss"),
});

export type WorkerRuntimeEnv = {
  DATABASE_URL: string;
  S3_ENDPOINT: string;
  S3_REGION: string;
  S3_BUCKET: string;
  S3_ACCESS_KEY_ID: string;
  S3_SECRET_ACCESS_KEY: string;
  CLAUDE_CODE_BIN: string;
  CLAUDE_CODE_MODEL: string;
  CLAUDE_CODE_TIMEOUT_MS: number;
  CLAUDE_CODE_MAX_BUDGET_USD: number;
  CLAUDE_CODE_MAX_TURNS: number;
  CLAUDE_CODE_ALLOWED_TOOLS: string[];
  LOG_LEVEL: string;
  WORKER_PORT: number;
  WORKER_CONCURRENCY: number;
  WORKER_TMP_ROOT: string;
  PG_BOSS_SCHEMA: string;
};

export type WorkerQueueConfig = {
  name: string;
  schema: string;
  newJobCheckIntervalSeconds: number;
  archiveCompletedAfterSeconds: number;
};

export type WorkerRunConfig = {
  keepWorkdirs: boolean;
};

export type WorkerConfig = {
  port: number;
  databaseUrl: string;
  queue: WorkerQueueConfig;
  runtimeEnv: WorkerRuntimeEnv;
  run: WorkerRunConfig;
};

export function readWorkerRuntimeEnv(): WorkerRuntimeEnv {
  const workerEnv = workerEnvSchema.parse(process.env);

  return {
    DATABASE_URL:
      sharedEnv.DATABASE_URL ??
      "postgresql://skill_builder:skill_builder@127.0.0.1:5432/skill_builder",
    S3_ENDPOINT: sharedEnv.S3_ENDPOINT ?? "http://127.0.0.1:9000",
    S3_REGION: process.env.S3_REGION ?? "us-east-1",
    S3_BUCKET: sharedEnv.S3_BUCKET ?? "skill-builder-artifacts",
    S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID ?? "minio",
    S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY ?? "minio123",
    CLAUDE_CODE_BIN: sharedEnv.CLAUDE_CODE_BIN ?? "claude",
    CLAUDE_CODE_MODEL: sharedEnv.CLAUDE_CODE_MODEL ?? "claude-sonnet-4-5",
    CLAUDE_CODE_TIMEOUT_MS: sharedEnv.CLAUDE_CODE_TIMEOUT_MS ?? 300_000,
    CLAUDE_CODE_MAX_BUDGET_USD: Number(process.env.CLAUDE_CODE_MAX_BUDGET_USD ?? 5),
    CLAUDE_CODE_MAX_TURNS: Number(process.env.CLAUDE_CODE_MAX_TURNS ?? 8),
    CLAUDE_CODE_ALLOWED_TOOLS: (process.env.CLAUDE_CODE_ALLOWED_TOOLS ??
      "Read,Edit,Write,Bash")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    LOG_LEVEL: process.env.LOG_LEVEL ?? "info",
    WORKER_PORT: workerEnv.WORKER_PORT,
    WORKER_CONCURRENCY: workerEnv.WORKER_CONCURRENCY,
    WORKER_TMP_ROOT: workerEnv.WORKER_TMP_ROOT,
    PG_BOSS_SCHEMA: workerEnv.PG_BOSS_SCHEMA,
  };
}

export function readWorkerConfig(): WorkerConfig {
  const env = readWorkerRuntimeEnv();

  return {
    port: env.WORKER_PORT,
    databaseUrl: env.DATABASE_URL,
    queue: {
      name: "iteration.launch",
      schema: env.PG_BOSS_SCHEMA,
      newJobCheckIntervalSeconds: 2,
      archiveCompletedAfterSeconds: 60 * 60 * 24,
    },
    runtimeEnv: env,
    run: {
      keepWorkdirs: process.env.WORKER_KEEP_WORKDIRS === "true",
    },
  };
}
import { sharedEnv } from "@skill-builder/shared";

export type WorkerConfig = {
  port: number;
  databaseUrl: string;
  s3Endpoint: string;
  s3Bucket: string;
  claudeBinary: string;
  claudeModel: string;
  claudeTimeoutMs: number;
  workerConcurrency: number;
  bossSchema: string;
};

export function getWorkerConfig(): WorkerConfig {
  return {
    port: Number(process.env.WORKER_PORT ?? 3001),
    databaseUrl:
      sharedEnv.DATABASE_URL ??
      "postgresql://skill_builder:skill_builder@127.0.0.1:5432/skill_builder",
    s3Endpoint: sharedEnv.S3_ENDPOINT ?? "http://127.0.0.1:9000",
    s3Bucket: sharedEnv.S3_BUCKET ?? "skill-builder-artifacts",
    claudeBinary: sharedEnv.CLAUDE_CODE_BIN ?? "claude",
    claudeModel: sharedEnv.CLAUDE_CODE_MODEL ?? "claude-sonnet-4-5",
    claudeTimeoutMs: sharedEnv.CLAUDE_CODE_TIMEOUT_MS ?? 300_000,
    workerConcurrency: Number(process.env.WORKER_CONCURRENCY ?? 2),
    bossSchema: process.env.PG_BOSS_SCHEMA ?? "pgboss",
  };
}
