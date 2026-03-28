import { z } from "zod";

import {
  skillFileKindSchema,
  skillVersionStatusSchema,
  skillVersionTransition,
} from "../enums";

const timestampSchema = z.string().datetime();

export const skillFileSchema = z.object({
  id: z.string().uuid(),
  skillVersionId: z.string().uuid(),
  path: z.string().min(1).max(255),
  kind: skillFileKindSchema,
  content: z.string(),
  sha256: z.string().length(64).nullable(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const skillVersionSchema = z.object({
  id: z.string().uuid(),
  skillId: z.string().uuid(),
  versionNumber: z.number().int().positive(),
  status: skillVersionStatusSchema,
  baseVersionId: z.string().uuid().nullable(),
  frontmatterName: z.string().min(1).max(64),
  frontmatterDescription: z.string().min(1).max(1024),
  bundleHash: z.string().length(64).nullable(),
  createdBy: z.string().min(1),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  files: z.array(skillFileSchema).default([]),
});

export const skillSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  name: z.string().min(1).max(120),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  currentDraftVersionId: z.string().uuid().nullable(),
  acceptedVersionId: z.string().uuid().nullable(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  versions: z.array(skillVersionSchema).default([]),
});

export const createSkillSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1).max(120),
  slug: z.string().regex(/^[a-z0-9-]+$/),
});

export const createSkillVersionSchema = z.object({
  skillId: z.string().uuid(),
  baseVersionId: z.string().uuid().nullable().optional(),
  frontmatterName: z.string().min(1).max(64),
  frontmatterDescription: z.string().min(1).max(1024),
  createdBy: z.string().min(1),
});

export const upsertSkillFileSchema = z.object({
  skillVersionId: z.string().uuid(),
  path: z.string().min(1).max(255),
  kind: skillFileKindSchema,
  content: z.string(),
});

export const transitionSkillVersionSchema = z.object({
  from: skillVersionStatusSchema,
  to: skillVersionTransition,
});
