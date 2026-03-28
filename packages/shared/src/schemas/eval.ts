import { z } from "zod";

import {
  assertionTypeSchema,
  entityIdSchema,
  evalSetStatusSchema,
} from "../enums";

export const evalCaseFileSchema = z.object({
  path: z.string().min(1),
  content: z.string(),
});

export const assertionConfigSchema = z.record(z.string(), z.unknown()).default({});

export const assertionSchema = z.object({
  id: entityIdSchema,
  evalCaseId: entityIdSchema,
  text: z.string().min(1),
  type: assertionTypeSchema,
  config: assertionConfigSchema,
  isQuantitative: z.boolean().default(false),
});

export const evalCaseSchema = z.object({
  id: entityIdSchema,
  evalSetId: entityIdSchema,
  slug: z.string().min(1),
  prompt: z.string().min(1),
  expectedOutput: z.string().default(""),
  files: z.array(evalCaseFileSchema).default([]),
  assertions: z.array(assertionSchema).default([]),
});

export const evalSetSchema = z.object({
  id: entityIdSchema,
  projectId: entityIdSchema,
  name: z.string().min(1),
  status: evalSetStatusSchema,
  cases: z.array(evalCaseSchema).default([]),
});

export const createEvalSetInputSchema = evalSetSchema.pick({
  projectId: true,
  name: true,
}).extend({
  id: entityIdSchema.optional(),
});

export const createEvalCaseInputSchema = evalCaseSchema.pick({
  evalSetId: true,
  slug: true,
  prompt: true,
  expectedOutput: true,
  files: true,
  assertions: true,
}).extend({
  id: entityIdSchema.optional(),
});

export type Assertion = z.infer<typeof assertionSchema>;
export type EvalCase = z.infer<typeof evalCaseSchema>;
export type EvalSet = z.infer<typeof evalSetSchema>;
