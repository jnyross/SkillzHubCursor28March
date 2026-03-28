import { z } from "zod";

import { PROJECT_STATUS_VALUES } from "../enums";

export const projectStatusSchema = z.enum(PROJECT_STATUS_VALUES);

export const projectBriefSchema = z.object({
  sourceRequest: z.string().min(1),
  problemStatement: z.string().min(1),
  targetUser: z.string().min(1),
  outputExpectations: z.array(z.string().min(1)).min(1),
  assumptions: z.array(z.string().min(1)).default([]),
  openQuestions: z.array(z.string().min(1)).default([]),
});

export const createProjectInputSchema = z.object({
  name: z.string().min(1).max(160),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .min(3)
    .max(80),
  brief: projectBriefSchema.optional(),
});

export const updateProjectInputSchema = createProjectInputSchema.partial();

export const projectRecordSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  status: projectStatusSchema,
  ownerUserId: z.string().min(1),
  briefJson: projectBriefSchema.nullable(),
  briefApprovedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ProjectBrief = z.infer<typeof projectBriefSchema>;
export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectInputSchema>;
export type ProjectRecord = z.infer<typeof projectRecordSchema>;
