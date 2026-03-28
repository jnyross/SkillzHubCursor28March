import pino from "pino";

import { getWorkerConfig } from "./config";

const config = getWorkerConfig();

export const workerLogger = pino({
  service: "worker",
  level: config.logLevel,
});
