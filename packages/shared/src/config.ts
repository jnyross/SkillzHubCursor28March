import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const sharedEnv = createEnv({
  server: {
    DATABASE_URL: z.string().min(1).optional(),
    DIRECT_DATABASE_URL: z.string().min(1).optional(),
    S3_ENDPOINT: z.string().url().optional(),
    S3_BUCKET: z.string().min(1).optional(),
    CLAUDE_CODE_BIN: z.string().min(1).optional(),
    CLAUDE_CODE_MODEL: z.string().min(1).optional(),
    CLAUDE_CODE_TIMEOUT_MS: z.coerce.number().int().positive().optional(),
    APP_LOCAL_USER: z.string().min(1).optional(),
    APP_LOCAL_PASSWORD: z.string().min(1).optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
