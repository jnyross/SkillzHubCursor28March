import { z } from "zod";

import { runConfigSchema, runStatusSchema, skillModeSchema } from "../enums";

export const runMetricsSchema = z.object({
  totalTokens: z.number().int().nonnegative().nullable(),
  durationMs: z.number().int().nonnegative().nullable(),
  totalCostUsd: z.number().nonnegative().nullable(),
});

export const runArtifactPointerSchema = z.object({
  artifactStorageUri: z.string().min(1).nullable(),
  transcriptUri: z.string().min(1).nullable(),
  manifestHash: z.string().length(64).nullable(),
});

export const runRecordSchema = z.object({
  id: z.string().uuid(),
  iterationId: z.string().uuid(),
  evalSnapshotId: z.string().uuid(),
  config: runConfigSchema,
  status: runStatusSchema,
  provider: z.string().min(1).default("claude-code"),
  modelId: z.string().min(1),
  templateHash: z.string().length(64),
  skillMode: skillModeSchema,
  skillBundleHash: z.string().length(64).nullable(),
  failureReason: z.string().nullable(),
  startedAt: z.coerce.date().nullable(),
  completedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  ...runMetricsSchema.shape,
  ...runArtifactPointerSchema.shape,
});

export type RunRecord = z.infer<typeof runRecordSchema>;
