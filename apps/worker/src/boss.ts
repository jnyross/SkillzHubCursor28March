import PgBoss from "pg-boss";

import type { WorkerConfig } from "./config";
import { workerLogger } from "./logger";

export function createBoss(config: WorkerConfig) {
  return new PgBoss({
    connectionString: config.databaseUrl,
    schema: config.bossSchema,
    retryLimit: 2,
    retryDelay: 5,
    archiveCompletedAfterSeconds: 60 * 60 * 24,
    archiveFailedAfterSeconds: 60 * 60 * 24 * 7,
    deleteAfterDays: 14,
    monitorStateIntervalSeconds: 0,
  });
}

export async function startBoss(boss: PgBoss) {
  await boss.start();
  workerLogger.info({ event: "worker.boss.started" }, "pg-boss started");
  return boss;
}

export async function createWorkerBoss(config: WorkerConfig) {
  const boss = createBoss(config);
  await startBoss(boss);
  return boss;
}
