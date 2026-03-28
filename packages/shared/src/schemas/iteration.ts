import { z } from "zod";

import {
  iterationStatuses,
  pairStatuses,
  runConfigs,
  runStatuses,
} from "../enums";

export const runConfigSchema = z.enum(runConfigs);
export const runStatusSchema = z.enum(runStatuses);
export const pairStatusSchema = z.enum(pairStatuses);
export const iterationStatusSchema = z.enum(iterationStatuses);

export const modelConfigSchema = z.object({
  modelId: z.string().min(1),
  maxTurns: z.number().int().positive().default(8),
  maxBudgetUsd: z.number().positive().default(5),
  timeoutMs: z.number().int().positive().max(30 * 60 * 1000).default(300_000),
});

export const toolConfigSchema = z.object({
  permissionMode: z.enum(["auto", "default"]).default("auto"),
  allowedTools: z.array(z.string().min(1)).min(1),
});

export const runTemplateSchema = z.object({
  evalSnapshotId: z.string().uuid(),
  inputFilesHash: z.string().min(1),
  prompt: z.string().min(1),
  modelConfig: modelConfigSchema,
  toolConfig: toolConfigSchema,
});

export const runSchema = z.object({
  id: z.string().uuid(),
  iterationId: z.string().uuid(),
  evalSnapshotId: z.string().uuid(),
  config: runConfigSchema,
  status: runStatusSchema,
  templateHash: z.string().min(1),
  provider: z.string().default("claude-code"),
  modelId: z.string().min(1),
  skillBundleHash: z.string().nullable().default(null),
  totalTokens: z.number().int().nonnegative().nullable().default(null),
  durationMs: z.number().int().nonnegative().nullable().default(null),
  totalCostUsd: z.number().nonnegative().nullable().default(null),
  transcriptUri: z.string().nullable().default(null),
  artifactStorageUri: z.string().nullable().default(null),
  manifestHash: z.string().nullable().default(null),
  failureReason: z.string().nullable().default(null),
  startedAt: z.string().datetime().nullable().default(null),
  completedAt: z.string().datetime().nullable().default(null),
  createdAt: z.string().datetime(),
});

export const comparablePairSchema = z.object({
  id: z.string().uuid(),
  iterationId: z.string().uuid(),
  evalSnapshotId: z.string().uuid(),
  primaryRunId: z.string().uuid(),
  baselineRunId: z.string().uuid(),
  templateHash: z.string().min(1),
  status: pairStatusSchema,
  candidateAssignment: z
    .object({
      candidateA: z.enum(["primary", "baseline"]),
      candidateB: z.enum(["primary", "baseline"]),
    })
    .refine((value) => value.candidateA !== value.candidateB, {
      message: "Blind review candidates must map to different runs.",
    }),
});

export const iterationSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  number: z.number().int().positive(),
  skillVersionId: z.string().uuid(),
  baselineSkillVersionId: z.string().uuid().nullable().default(null),
  evalSetId: z.string().uuid(),
  templateHash: z.string().min(1),
  modelConfig: modelConfigSchema,
  toolConfig: toolConfigSchema,
  status: iterationStatusSchema,
  totalPairs: z.number().int().nonnegative(),
  gradedPairCount: z.number().int().nonnegative(),
  reviewedAt: z.string().datetime().nullable().default(null),
  reviewNotes: z.string().nullable().default(null),
  startedAt: z.string().datetime().nullable().default(null),
  completedAt: z.string().datetime().nullable().default(null),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
