import { logger } from "@skill-builder/shared";

export const workerLogger = logger.child({
  service: "worker",
});
