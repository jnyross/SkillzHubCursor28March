import { z } from "zod";

export const entityIdSchema = z.string().min(1);

export const projectStatuses = ["draft", "active", "archived"] as const;
export const projectStatusSchema = z.enum(projectStatuses);
export const PROJECT_STATUS_VALUES = projectStatuses;
export type ProjectStatus = (typeof projectStatuses)[number];

export const skillVersionStatuses = [
  "draft",
  "frozen",
  "accepted",
  "superseded",
  "abandoned",
] as const;
export const skillVersionStatusSchema = z.enum(skillVersionStatuses);
export type SkillVersionStatus = (typeof skillVersionStatuses)[number];

export const evalSetStatuses = ["draft", "frozen", "retired"] as const;
export const evalSetStatusSchema = z.enum(evalSetStatuses);
export type EvalSetStatus = (typeof evalSetStatuses)[number];

export const iterationStatuses = [
  "draft",
  "queued",
  "running",
  "reviewing",
  "completed",
  "failed",
] as const;
export const iterationStatusSchema = z.enum(iterationStatuses);
export type IterationStatus = (typeof iterationStatuses)[number];

export const runConfigs = ["with_skill", "without_skill", "old_skill"] as const;
export const runConfigSchema = z.enum(runConfigs);
export type RunConfig = (typeof runConfigs)[number];
export const skillModeSchema = runConfigSchema;
export type SkillMode = RunConfig;

export const runStatuses = [
  "queued",
  "running",
  "succeeded",
  "failed",
  "canceled",
] as const;
export const runStatusSchema = z.enum(runStatuses);
export type RunStatus = (typeof runStatuses)[number];

export const comparablePairStatuses = [
  "pending",
  "comparable",
  "graded",
  "excluded",
] as const;
export const comparablePairStatusSchema = z.enum(comparablePairStatuses);
export const pairStatuses = comparablePairStatuses;
export type ComparablePairStatus = (typeof comparablePairStatuses)[number];

export const assertionTypes = [
  "file_exists",
  "text_contains",
  "regex_match",
  "llm_graded",
] as const;
export const assertionTypeSchema = z.enum(assertionTypes);
export type AssertionType = (typeof assertionTypes)[number];

export const skillFileKinds = ["skill_md", "script", "reference", "asset"] as const;
export const skillFileKindSchema = z.enum(skillFileKinds);
export type SkillFileKind = (typeof skillFileKinds)[number];

export const reviewCandidates = ["candidate_a", "candidate_b"] as const;
export const reviewCandidateSchema = z.enum(reviewCandidates);
export type ReviewCandidate = (typeof reviewCandidates)[number];

export const providerIds = ["claude-code"] as const;
export const providerIdSchema = z.enum(providerIds);
export const providerSchema = providerIdSchema;
export type ProviderId = (typeof providerIds)[number];
