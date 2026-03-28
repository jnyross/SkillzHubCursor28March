export * from "./client";
export * from "./repositories";
export * from "./schema";

export type DatabaseHealth = {
  status: "ready";
  migrationsDir: string;
};

export const databaseHealth: DatabaseHealth = {
  status: "ready",
  migrationsDir: "packages/db/migrations",
};
