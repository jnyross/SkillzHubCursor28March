import { z } from "zod";

import { providerIdSchema, runConfigSchema, runStatusSchema } from "../enums";

const timestampSchema = z.string().datetime();

export const runMetricsSchema = z.object({
  totalTokens: z.number().int().nonnegative().nullable().default(null),
  durationMs: z.number().int().nonnegative().nullable().default(null),
  totalCostUsd: z.number().nonnegative().nullable().default(null),
});

export const runArtifactPointerSchema = z.object({
  artifactStorageUri: z.string().min(1).nullable().default(null),
  transcriptUri: z.string().min(1).nullable().default(null),
  manifestHash: z.string().length(64).nullable().default(null),
});

export const runRecordSchema = z.object({
  id: z.string().uuid(),
  iterationId: z.string().uuid(),
  evalSnapshotId: z.string().uuid(),
  config: runConfigSchema,
  status: runStatusSchema,
  provider: providerIdSchema.default("claude-code"),
  modelId: z.string().min(1),
  templateHash: z.string().min(1),
  skillMode: runConfigSchema,
  skillBundleHash: z.string().length(64).nullable().default(null),
  failureReason: z.string().nullable().default(null),
  startedAt: timestampSchema.nullable().default(null),
  completedAt: timestampSchema.nullable().default(null),
  createdAt: timestampSchema,
  ...runMetricsSchema.shape,
  ...runArtifactPointerSchema.shape,
});

export type RunRecord = z.infer<typeof runRecordSchema>;
