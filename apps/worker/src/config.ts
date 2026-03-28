import { sharedEnv } from "@skill-builder/shared";

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
  return {
    databaseUrl:
      sharedEnv.DATABASE_URL ??
      "postgresql://skill_builder:skill_builder@127.0.0.1:5432/skill_builder",
    s3Endpoint: sharedEnv.S3_ENDPOINT ?? "http://127.0.0.1:9000",
    s3Region: process.env.S3_REGION ?? "us-east-1",
    s3Bucket: sharedEnv.S3_BUCKET ?? "skill-builder-artifacts",
    s3AccessKeyId: process.env.S3_ACCESS_KEY_ID ?? "minio",
    s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "minio123",
    claudeBinary: sharedEnv.CLAUDE_CODE_BIN ?? "claude",
    claudeModel: sharedEnv.CLAUDE_CODE_MODEL ?? "claude-sonnet-4-5",
    claudeTimeoutMs: sharedEnv.CLAUDE_CODE_TIMEOUT_MS ?? 300_000,
    claudeMaxBudgetUsd: Number(process.env.CLAUDE_CODE_MAX_BUDGET_USD ?? 5),
    claudeMaxTurns: Number(process.env.CLAUDE_CODE_MAX_TURNS ?? 8),
    claudeAllowedTools: (process.env.CLAUDE_CODE_ALLOWED_TOOLS ??
      "Read,Edit,Write,Bash")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    logLevel: process.env.LOG_LEVEL ?? "info",
  };
}

export function getWorkerConfig(): WorkerConfig {
  const runtimeEnv = readWorkerRuntimeEnv();

  return {
    port: Number(process.env.WORKER_PORT ?? 3001),
    databaseUrl: runtimeEnv.databaseUrl,
    queue: {
      launchQueue: "iteration.launch",
      schema: process.env.PG_BOSS_SCHEMA ?? "pgboss",
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
      tmpRoot: process.env.WORKER_TMP_ROOT ?? "/workspace/.data/worker-runs",
      concurrency: Number(process.env.WORKER_CONCURRENCY ?? 2),
    },
    logLevel: runtimeEnv.logLevel,
    runtimeEnv,
  };
}
