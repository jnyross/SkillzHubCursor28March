export const projectStatuses = ["draft", "active", "archived"] as const;
export type ProjectStatus = (typeof projectStatuses)[number];

export const skillVersionStatuses = [
  "draft",
  "frozen",
  "accepted",
  "superseded",
  "abandoned",
] as const;
export type SkillVersionStatus = (typeof skillVersionStatuses)[number];

export const evalSetStatuses = ["draft", "frozen", "retired"] as const;
export type EvalSetStatus = (typeof evalSetStatuses)[number];

export const iterationStatuses = [
  "draft",
  "queued",
  "running",
  "reviewing",
  "completed",
  "failed",
] as const;
export type IterationStatus = (typeof iterationStatuses)[number];

export const runConfigs = ["with_skill", "without_skill", "old_skill"] as const;
export type RunConfig = (typeof runConfigs)[number];

export const runStatuses = [
  "queued",
  "running",
  "succeeded",
  "failed",
  "canceled",
] as const;
export type RunStatus = (typeof runStatuses)[number];

export const comparablePairStatuses = [
  "pending",
  "comparable",
  "graded",
  "excluded",
] as const;
export type ComparablePairStatus = (typeof comparablePairStatuses)[number];

export const assertionTypes = [
  "file_exists",
  "text_contains",
  "regex_match",
  "llm_graded",
] as const;
export type AssertionType = (typeof assertionTypes)[number];

export const skillFileKinds = ["skill_md", "script", "reference", "asset"] as const;
export type SkillFileKind = (typeof skillFileKinds)[number];

export const reviewCandidates = ["candidate_a", "candidate_b"] as const;
export type ReviewCandidate = (typeof reviewCandidates)[number];

export const providerIds = ["claude-code"] as const;
export type ProviderId = (typeof providerIds)[number];
