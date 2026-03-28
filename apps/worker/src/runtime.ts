import { createServer, type Server } from "node:http";
import PgBoss from "pg-boss";

import { pool } from "@skill-builder/db";

import { createBoss } from "./boss";
import { getWorkerConfig, type WorkerConfig } from "./config";
import { workerLogger } from "./logger";

export type WorkerRuntime = {
  boss: PgBoss;
  config: WorkerConfig;
  server: Server;
};

export async function startWorkerRuntime(): Promise<WorkerRuntime> {
  const config = getWorkerConfig();
  const logger = workerLogger.child({
    component: "runtime",
    port: config.port,
  });

  await pool.query("select 1");

  const boss = createBoss(config);
  await boss.start();
  await boss.createQueue(config.queue.name);
  logger.info({ event: "worker.boss.started", queue: config.queue.name }, "pg-boss started");

  const server = createServer(async (_request, response) => {
    const connectionState = await pool.query("select current_database() as database_name");

    response.writeHead(200, { "content-type": "application/json" });
    response.end(
      JSON.stringify({
        service: "worker",
        status: "ok",
        port: config.port,
        bossSchema: config.queue.schema,
        queueName: config.queue.name,
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
      bossSchema: config.queue.schema,
      dbHost: new URL(config.databaseUrl).host,
      s3Endpoint: config.s3.endpoint,
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

  return { boss, config, server };
}
