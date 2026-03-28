import { z } from "zod";

import { sharedEnv } from "@skill-builder/shared";

const workerRuntimeSchema = z.object({
  WORKER_PORT: z.coerce.number().int().positive().default(3001),
  WORKER_CONCURRENCY: z.coerce.number().int().positive().default(2),
  WORKER_TMP_ROOT: z.string().min(1).default("/workspace/.data/worker-runs"),
  PG_BOSS_SCHEMA: z.string().min(1).default("pgboss"),
  S3_REGION: z.string().min(1).default("us-east-1"),
  S3_ACCESS_KEY_ID: z.string().min(1).default("minio"),
  S3_SECRET_ACCESS_KEY: z.string().min(1).default("minio123"),
  CLAUDE_CODE_MAX_BUDGET_USD: z.coerce.number().positive().default(5),
  CLAUDE_CODE_MAX_TURNS: z.coerce.number().int().positive().default(8),
  CLAUDE_CODE_ALLOWED_TOOLS: z.string().min(1).default("Read,Edit,Write,Bash"),
  LOG_LEVEL: z.string().min(1).default("info"),
});

export type WorkerRuntimeEnv = {
  databaseUrl: string;
  s3Endpoint: string;
  s3Region: string;
  s3Bucket: string;
  s3AccessKeyId: string;
  s3SecretAccessKey: string;
  claudeBinary: string;
  claudeModel: string;
  claudeTimeoutMs: number;
  claudeMaxBudgetUsd: number;
  claudeMaxTurns: number;
  claudeAllowedTools: string[];
  logLevel: string;
};

export type WorkerQueueConfig = {
  launchQueue: string;
  schema: string;
  newJobCheckIntervalSeconds: number;
  archiveCompletedAfterSeconds: number;
};

export type WorkerRunConfig = {
  keepWorkdirs: boolean;
  tmpRoot: string;
  concurrency: number;
};

export type WorkerConfig = {
  port: number;
  databaseUrl: string;
  queue: WorkerQueueConfig;
  s3: {
    endpoint: string;
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  claude: {
    binary: string;
    model: string;
    timeoutMs: number;
    maxBudgetUsd: number;
    maxTurns: number;
    allowedTools: string[];
  };
  run: WorkerRunConfig;
  logLevel: string;
  runtimeEnv: WorkerRuntimeEnv;
};

export function readWorkerRuntimeEnv(): WorkerRuntimeEnv {
  const env = workerRuntimeSchema.parse(process.env);

  return {
    databaseUrl:
      sharedEnv.DATABASE_URL ??
      "postgresql://skill_builder:skill_builder@127.0.0.1:5432/skill_builder",
    s3Endpoint: sharedEnv.S3_ENDPOINT ?? "http://127.0.0.1:9000",
    s3Region: env.S3_REGION,
    s3Bucket: sharedEnv.S3_BUCKET ?? "skill-builder-artifacts",
    s3AccessKeyId: env.S3_ACCESS_KEY_ID,
    s3SecretAccessKey: env.S3_SECRET_ACCESS_KEY,
    claudeBinary: sharedEnv.CLAUDE_CODE_BIN ?? "claude",
    claudeModel: sharedEnv.CLAUDE_CODE_MODEL ?? "claude-sonnet-4-5",
    claudeTimeoutMs: sharedEnv.CLAUDE_CODE_TIMEOUT_MS ?? 300_000,
    claudeMaxBudgetUsd: env.CLAUDE_CODE_MAX_BUDGET_USD,
    claudeMaxTurns: env.CLAUDE_CODE_MAX_TURNS,
    claudeAllowedTools: env.CLAUDE_CODE_ALLOWED_TOOLS
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    logLevel: env.LOG_LEVEL,
  };
}

export function getWorkerConfig(): WorkerConfig {
  const runtimeEnv = readWorkerRuntimeEnv();
  const env = workerRuntimeSchema.parse(process.env);

  return {
    port: env.WORKER_PORT,
    databaseUrl: runtimeEnv.databaseUrl,
    queue: {
      launchQueue: "iteration.launch",
      schema: env.PG_BOSS_SCHEMA,
      newJobCheckIntervalSeconds: 2,
      archiveCompletedAfterSeconds: 60 * 60 * 24,
    },
    s3: {
      endpoint: runtimeEnv.s3Endpoint,
      region: runtimeEnv.s3Region,
      bucket: runtimeEnv.s3Bucket,
      accessKeyId: runtimeEnv.s3AccessKeyId,
      secretAccessKey: runtimeEnv.s3SecretAccessKey,
    },
    claude: {
      binary: runtimeEnv.claudeBinary,
      model: runtimeEnv.claudeModel,
      timeoutMs: runtimeEnv.claudeTimeoutMs,
      maxBudgetUsd: runtimeEnv.claudeMaxBudgetUsd,
      maxTurns: runtimeEnv.claudeMaxTurns,
      allowedTools: runtimeEnv.claudeAllowedTools,
    },
    run: {
      keepWorkdirs: process.env.WORKER_KEEP_WORKDIRS === "true",
      tmpRoot: env.WORKER_TMP_ROOT,
      concurrency: env.WORKER_CONCURRENCY,
    },
    logLevel: runtimeEnv.logLevel,
    runtimeEnv,
  };
}
