import pino from "pino";

import { getWorkerConfig } from "./config";

const config = getWorkerConfig();

export const workerLogger = pino({
  name: "skill-builder-worker",
  level: config.logLevel,
});
