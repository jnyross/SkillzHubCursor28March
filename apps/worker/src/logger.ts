import { logger } from "@skill-builder/shared";

export const workerLogger = logger.child({
  service: "worker",
});
import pino from "pino";

import { workerConfig } from "./config";

export const workerLogger = pino({
  name: "skill-builder-worker",
  level: workerConfig.logLevel,
});
