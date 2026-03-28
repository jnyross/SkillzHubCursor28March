import { createServer, type Server } from "node:http";
import type PgBoss from "pg-boss";

import { db, pool } from "@skill-builder/db";

import {
  createBoss,
  ensureQueue,
  type WorkerBossRegistration,
} from "./boss";
import { getWorkerConfig, type WorkerConfig } from "./config";
import { workerLogger } from "./logger";

export type WorkerRuntime = {
  boss: PgBoss;
  config: WorkerConfig;
  server: Server;
};

export async function startWorkerRuntime(
  registrations: WorkerBossRegistration[] = [],
): Promise<WorkerRuntime> {
  const config = getWorkerConfig();
  const logger = workerLogger.child({
    component: "runtime",
    port: config.port,
  });

  await pool.query("select 1");

  const boss = createBoss(config.databaseUrl, config.bossSchema);
  await boss.start();
  logger.info({ event: "worker.boss.started" }, "pg-boss started");

  for (const registration of registrations) {
    await ensureQueue(boss, registration);
  }

  const server = createServer(async (_request, response) => {
    const connectionState = await pool.query("select current_database() as database_name");

    response.writeHead(200, { "content-type": "application/json" });
    response.end(
      JSON.stringify({
        service: "worker",
        status: "ok",
        port: config.port,
        bossSchema: config.bossSchema,
        queueRegistrations: registrations.map((registration) => registration.name),
        database: connectionState.rows[0]?.database_name ?? null,
        timestamp: new Date().toISOString(),
      }),
    );
  });

  await new Promise<void>((resolve) => {
    server.listen(config.port, resolve);
  });

  logger.info(
    {
      event: "worker.started",
      bossSchema: config.bossSchema,
      dbHost: new URL(config.databaseUrl).host,
      s3Endpoint: config.s3Endpoint,
    },
    "Worker runtime started",
  );

  async function shutdown(signal: string) {
    logger.info({ event: "worker.shutdown", signal }, "Stopping worker runtime");
    server.close();
    await boss.stop();
    await pool.end();
  }

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });

  void db;

  return { boss, config, server };
}
