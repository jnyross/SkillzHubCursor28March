import { z } from "zod";

import { entityIdSchema, runConfigSchema } from "../enums";

export const metricSummarySchema = z.object({
  mean: z.number().finite(),
  stddev: z.number().finite(),
});

export const benchmarkConfigSummarySchema = z.object({
  config: runConfigSchema,
  passRate: z.number().min(0).max(1),
  meanPassCount: metricSummarySchema,
  durationMs: metricSummarySchema,
  totalTokens: metricSummarySchema,
  totalCostUsd: metricSummarySchema,
});

export const benchmarkDeltaSchema = z.object({
  passRateDelta: z.number().finite(),
  durationMsDelta: z.number().finite(),
  tokenDelta: z.number().finite(),
  costDeltaUsd: z.number().finite(),
});

export const benchmarkSchema = z.object({
  iterationId: entityIdSchema,
  benchmarkHash: z.string().min(1),
  generatedAt: z.iso.datetime(),
  comparablePairCount: z.number().int().nonnegative(),
  excludedPairCount: z.number().int().nonnegative(),
  configs: z.array(benchmarkConfigSummarySchema).min(2),
  deltaAgainstBaseline: benchmarkDeltaSchema,
  notes: z.array(z.string().min(1)).default([]),
  createdAt: z.iso.datetime().optional(),
});

export type Benchmark = z.infer<typeof benchmarkSchema>;
