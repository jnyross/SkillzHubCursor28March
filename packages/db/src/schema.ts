import {
  boolean,
  check,
  foreignKey,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const projectStatusEnum = pgEnum("project_status", ["draft", "active", "archived"]);
export const skillVersionStatusEnum = pgEnum("skill_version_status", [
  "draft",
  "frozen",
  "accepted",
  "superseded",
  "abandoned",
]);
export const skillFileKindEnum = pgEnum("skill_file_kind", [
  "skill_md",
  "script",
  "reference",
  "asset",
]);
export const evalSetStatusEnum = pgEnum("eval_set_status", ["draft", "frozen"]);
export const assertionTypeEnum = pgEnum("assertion_type", [
  "file_exists",
  "text_contains",
  "regex_match",
  "llm_graded",
]);
export const iterationStatusEnum = pgEnum("iteration_status", [
  "draft",
  "queued",
  "running",
  "reviewing",
  "completed",
  "failed",
]);
export const runConfigEnum = pgEnum("run_config", ["with_skill", "without_skill", "old_skill"]);
export const runStatusEnum = pgEnum("run_status", [
  "queued",
  "running",
  "succeeded",
  "failed",
  "canceled",
]);
export const comparablePairStatusEnum = pgEnum("comparable_pair_status", [
  "pending",
  "comparable",
  "graded",
  "excluded",
]);
export const blindReviewCandidateEnum = pgEnum("blind_review_candidate", ["candidate_a", "candidate_b"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const projects = pgTable(
  "projects",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    status: projectStatusEnum("status").notNull().default("draft"),
    ownerUserId: text("owner_user_id").notNull(),
    briefJson: jsonb("brief_json").$type<Record<string, unknown> | null>().default(null),
    briefApprovedAt: timestamp("brief_approved_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => ({
    projectsSlugKey: unique("projects_slug_key").on(table.slug),
  }),
);

export const skills = pgTable(
  "skills",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    currentDraftVersionId: text("current_draft_version_id"),
    acceptedVersionId: text("accepted_version_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    skillsProjectSlugKey: unique("skills_project_slug_key").on(table.projectId, table.slug),
  }),
);

export const skillVersions = pgTable(
  "skill_versions",
  {
    id: text("id").primaryKey(),
    skillId: text("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "restrict" }),
    versionNumber: integer("version_number").notNull(),
    status: skillVersionStatusEnum("status").notNull().default("draft"),
    baseVersionId: text("base_version_id"),
    frontmatterName: text("frontmatter_name").notNull(),
    frontmatterDescription: text("frontmatter_description").notNull(),
    bundleHash: text("bundle_hash"),
    createdBy: text("created_by").notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => ({
    skillVersionUniqueNumber: unique("skill_versions_skill_id_version_number_key").on(
      table.skillId,
      table.versionNumber,
    ),
    skillVersionBaseFk: foreignKey({
      columns: [table.baseVersionId],
      foreignColumns: [table.id],
      name: "skill_versions_base_version_id_fkey",
    }).onDelete("restrict"),
  }),
);

export const skillFiles = pgTable(
  "skill_files",
  {
    id: text("id").primaryKey(),
    skillVersionId: text("skill_version_id")
      .notNull()
      .references(() => skillVersions.id, { onDelete: "restrict" }),
    path: text("path").notNull(),
    kind: skillFileKindEnum("kind").notNull(),
    storageUri: text("storage_uri").notNull(),
    sha256: text("sha256").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    skillFilesPathKey: unique("skill_files_skill_version_path_key").on(table.skillVersionId, table.path),
  }),
);

export const evalSets = pgTable(
  "eval_sets",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    status: evalSetStatusEnum("status").notNull().default("draft"),
    frozenAt: timestamp("frozen_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => ({
    evalSetsProjectNameKey: unique("eval_sets_project_name_key").on(table.projectId, table.name),
  }),
);

export const evalCases = pgTable(
  "eval_cases",
  {
    id: text("id").primaryKey(),
    evalSetId: text("eval_set_id")
      .notNull()
      .references(() => evalSets.id, { onDelete: "restrict" }),
    slug: text("slug").notNull(),
    prompt: text("prompt").notNull(),
    expectedOutput: text("expected_output").notNull(),
    filesManifestJson: jsonb("files_manifest_json")
      .$type<Record<string, unknown>[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    evalCasesSetSlugKey: unique("eval_cases_eval_set_slug_key").on(table.evalSetId, table.slug),
  }),
);

export const assertions = pgTable(
  "assertions",
  {
    id: text("id").primaryKey(),
    evalCaseId: text("eval_case_id")
      .notNull()
      .references(() => evalCases.id, { onDelete: "restrict" }),
    text: text("text").notNull(),
    type: assertionTypeEnum("type").notNull(),
    configJson: jsonb("config_json").$type<Record<string, unknown>>().notNull(),
    isQuantitative: boolean("is_quantitative").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    assertionConfigShape: check(
      "assertions_config_json_object_check",
      sql`jsonb_typeof(${table.configJson}) = 'object'`,
    ),
  }),
);

export const iterations = pgTable(
  "iterations",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "restrict" }),
    number: integer("number").notNull(),
    skillVersionId: text("skill_version_id")
      .notNull()
      .references(() => skillVersions.id, { onDelete: "restrict" }),
    baselineSkillVersionId: text("baseline_skill_version_id"),
    evalSetId: text("eval_set_id")
      .notNull()
      .references(() => evalSets.id, { onDelete: "restrict" }),
    templateHash: text("template_hash").notNull(),
    modelConfigJson: jsonb("model_config_json").$type<Record<string, unknown>>().notNull(),
    toolConfigJson: jsonb("tool_config_json").$type<Record<string, unknown>>().notNull(),
    status: iterationStatusEnum("status").notNull().default("draft"),
    totalPairs: integer("total_pairs").notNull().default(0),
    gradedPairCount: integer("graded_pair_count").notNull().default(0),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewNotes: text("review_notes"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => ({
    iterationProjectNumberKey: unique("iterations_project_number_key").on(table.projectId, table.number),
    baselineVersionFk: foreignKey({
      columns: [table.baselineSkillVersionId],
      foreignColumns: [skillVersions.id],
      name: "iterations_baseline_skill_version_id_fkey",
    }).onDelete("restrict"),
  }),
);

export const iterationEvalSnapshots = pgTable(
  "iteration_eval_snapshots",
  {
    id: text("id").primaryKey(),
    iterationId: text("iteration_id")
      .notNull()
      .references(() => iterations.id, { onDelete: "restrict" }),
    evalCaseId: text("eval_case_id")
      .notNull()
      .references(() => evalCases.id, { onDelete: "restrict" }),
    promptSnapshot: text("prompt_snapshot").notNull(),
    expectedOutputSnapshot: text("expected_output_snapshot").notNull(),
    assertionsSnapshotJson: jsonb("assertions_snapshot_json")
      .$type<Record<string, unknown>[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    snapshotHash: text("snapshot_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    iterationSnapshotUniqueCase: unique("iteration_eval_snapshots_iteration_eval_case_key").on(
      table.iterationId,
      table.evalCaseId,
    ),
  }),
);

export const runs = pgTable(
  "runs",
  {
    id: text("id").primaryKey(),
    iterationId: text("iteration_id")
      .notNull()
      .references(() => iterations.id, { onDelete: "restrict" }),
    evalSnapshotId: text("eval_snapshot_id")
      .notNull()
      .references(() => iterationEvalSnapshots.id, { onDelete: "restrict" }),
    config: runConfigEnum("config").notNull(),
    status: runStatusEnum("status").notNull().default("queued"),
    provider: text("provider").notNull(),
    modelId: text("model_id").notNull(),
    templateHash: text("template_hash").notNull(),
    skillMode: runConfigEnum("skill_mode").notNull(),
    skillBundleHash: text("skill_bundle_hash"),
    totalTokens: integer("total_tokens"),
    durationMs: integer("duration_ms"),
    totalCostUsd: integer("total_cost_usd_micros"),
    artifactStorageUri: text("artifact_storage_uri"),
    manifestHash: text("manifest_hash"),
    transcriptUri: text("transcript_uri"),
    failureReason: text("failure_reason"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    runsUniqueConfigPerSnapshot: unique("runs_iteration_snapshot_config_key").on(
      table.iterationId,
      table.evalSnapshotId,
      table.config,
    ),
  }),
);

export const grades = pgTable(
  "grades",
  {
    id: text("id").primaryKey(),
    runId: text("run_id")
      .notNull()
      .references(() => runs.id, { onDelete: "restrict" }),
    graderVersion: text("grader_version").notNull(),
    gradingJson: jsonb("grading_json").$type<Record<string, unknown>>().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    gradesRunKey: unique("grades_run_id_key").on(table.runId),
    gradesJsonShape: check(
      "grades_grading_json_shape_check",
      sql`jsonb_typeof(${table.gradingJson}) = 'object'`,
    ),
  }),
);

export const comparablePairs = pgTable(
  "comparable_pairs",
  {
    id: text("id").primaryKey(),
    iterationId: text("iteration_id")
      .notNull()
      .references(() => iterations.id, { onDelete: "restrict" }),
    evalSnapshotId: text("eval_snapshot_id")
      .notNull()
      .references(() => iterationEvalSnapshots.id, { onDelete: "restrict" }),
    primaryRunId: text("primary_run_id")
      .notNull()
      .references(() => runs.id, { onDelete: "restrict" }),
    baselineRunId: text("baseline_run_id")
      .notNull()
      .references(() => runs.id, { onDelete: "restrict" }),
    templateHash: text("template_hash").notNull(),
    status: comparablePairStatusEnum("status").notNull().default("pending"),
    candidateAConfig: runConfigEnum("candidate_a_config").notNull(),
    candidateBConfig: runConfigEnum("candidate_b_config").notNull(),
    revealedAt: timestamp("revealed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    comparablePairsSnapshotKey: unique("comparable_pairs_iteration_snapshot_key").on(
      table.iterationId,
      table.evalSnapshotId,
    ),
  }),
);

export const benchmarks = pgTable(
  "benchmarks",
  {
    id: text("id").primaryKey(),
    iterationId: text("iteration_id")
      .notNull()
      .references(() => iterations.id, { onDelete: "restrict" }),
    benchmarkJson: jsonb("benchmark_json").$type<Record<string, unknown>>().notNull(),
    benchmarkHash: text("benchmark_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    benchmarkIterationKey: uniqueIndex("benchmarks_iteration_id_key").on(table.iterationId),
  }),
);

export const auditEvents = pgTable("audit_events", {
  id: text("id").primaryKey(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  eventType: text("event_type").notNull(),
  actorUserId: text("actor_user_id").notNull(),
  payloadJson: jsonb("payload_json").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const schema = {
  projects,
  skills,
  skillVersions,
  skillFiles,
  evalSets,
  evalCases,
  assertions,
  iterations,
  iterationEvalSnapshots,
  runs,
  grades,
  comparablePairs,
  benchmarks,
  auditEvents,
};

export type DatabaseSchema = typeof schema;
