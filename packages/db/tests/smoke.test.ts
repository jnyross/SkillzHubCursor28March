import { describe, expect, it } from "vitest";
import { databaseHealth } from "../src/index";

describe("packages/db smoke", () => {
  it("exports the database readiness marker", () => {
    expect(databaseHealth.status).toBe("ready");
    expect(databaseHealth.migrationsDir).toBe("packages/db/migrations");
  });
});
