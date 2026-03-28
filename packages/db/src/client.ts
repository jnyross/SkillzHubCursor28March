import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { schema, type DatabaseSchema } from "./schema";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://skill_builder:skill_builder@127.0.0.1:5432/skill_builder";

export const pool = new Pool({
  connectionString,
});

export const db = drizzle<DatabaseSchema>(pool, { schema });
