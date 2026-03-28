import { PgBoss } from "pg-boss";

import type { WorkerConfig } from "./config";
import { workerLogger } from "./logger";

export type WorkerBossRegistration = {
  name: string;
  options?: {
    retryLimit?: number;
    retryDelay?: number;
    expireInSeconds?: number;
  };
};

export function createBoss(config: WorkerConfig) {
  return new PgBoss({
    connectionString: config.databaseUrl,
    schema: config.queue.schema,
    monitorIntervalSeconds: 0,
  });
}

export async function startBoss(boss: PgBoss) {
  await boss.start();
  workerLogger.info({ event: "worker.boss.started" }, "pg-boss started");
  return boss;
}

export async function ensureQueue(
  boss: PgBoss,
  registration: WorkerBossRegistration,
) {
  await boss.createQueue(registration.name);
  workerLogger.info(
    {
      event: "worker.queue.ready",
      queue: registration.name,
    },
    "queue registered",
  );
}

export async function createWorkerBoss(config: WorkerConfig) {
  const boss = createBoss(config);
  await startBoss(boss);
  return boss;
}
