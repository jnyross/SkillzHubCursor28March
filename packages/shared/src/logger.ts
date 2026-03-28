import pino from "pino";

export const logger = pino({
  name: "skill-builder-webapp",
  level: process.env.LOG_LEVEL ?? "info",
});
