import { and, desc, eq, type InferSelectModel } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import {
  DomainError,
  type EvalSetStatus,
  type SkillVersionStatus,
  validateEvalSetTransition,
  validateSkillVersionTransition,
} from "@skill-builder/shared";

import {
  projects,
  skills,
  skillVersions,
  evalSets,
  type DatabaseSchema,
} from "./schema";

type Database = NodePgDatabase<DatabaseSchema>;

export type ProjectRecord = InferSelectModel<typeof projects>;
export interface CreateProjectInput {
  name: string;
  slug: string;
  ownerUserId: string;
  briefJson?: Record<string, unknown> | null;
}

export async function createProject(
  db: Database,
  input: CreateProjectInput,
): Promise<ProjectRecord> {
  const [project] = await db
    .insert(projects)
    .values({
      id: randomUUID(),
      ...input,
      status: "draft",
    })
    .returning();

  return project;
}

export type SkillRecord = InferSelectModel<typeof skills>;

export async function createSkill(
  db: Database,
  input: Pick<SkillRecord, "projectId" | "name" | "slug">,
): Promise<SkillRecord> {
  const [skill] = await db
    .insert(skills)
    .values({
      id: randomUUID(),
      ...input,
    })
    .returning();
  return skill;
}

export type SkillVersionRecord = InferSelectModel<typeof skillVersions>;

export async function createDraftSkillVersion(
  db: Database,
  input: Pick<
    SkillVersionRecord,
    | "skillId"
    | "versionNumber"
    | "baseVersionId"
    | "frontmatterName"
    | "frontmatterDescription"
    | "createdBy"
  >,
): Promise<SkillVersionRecord> {
  const [existingDraft] = await db
    .select()
    .from(skillVersions)
    .where(and(eq(skillVersions.skillId, input.skillId), eq(skillVersions.status, "draft")))
    .limit(1);

  if (existingDraft) {
    throw new Error(`Skill ${input.skillId} already has an active draft version.`);
  }

  const [skillVersion] = await db
    .insert(skillVersions)
    .values({
      id: randomUUID(),
      ...input,
      status: "draft",
      bundleHash: null,
    })
    .returning();

  return skillVersion;
}

export async function transitionSkillVersionStatus(
  db: Database,
  versionId: string,
  nextStatus: Exclude<SkillVersionStatus, "draft">,
): Promise<SkillVersionRecord> {
  return db.transaction(async (tx) => {
    const [current] = await tx
      .select()
      .from(skillVersions)
      .where(eq(skillVersions.id, versionId))
      .limit(1);

    if (!current) {
      throw new Error(`Skill version ${versionId} was not found.`);
    }

    validateSkillVersionTransition(
      current.status as "draft" | "frozen" | "accepted" | "superseded" | "abandoned",
      nextStatus,
    );

    if (nextStatus === "accepted") {
      const [existingAccepted] = await tx
        .select()
        .from(skillVersions)
        .where(
          and(eq(skillVersions.skillId, current.skillId), eq(skillVersions.status, "accepted")),
        )
        .limit(1);

      if (existingAccepted && existingAccepted.id !== versionId) {
        throw new Error(`Skill ${current.skillId} already has an accepted version.`);
      }
    }

    const [updated] = await tx
      .update(skillVersions)
      .set({
        status: nextStatus,
        bundleHash:
          nextStatus === "accepted" && !current.bundleHash ? current.bundleHash ?? "accepted" : current.bundleHash,
        updatedAt: new Date(),
      })
      .where(eq(skillVersions.id, versionId))
      .returning();

    return updated;
  });
}

export type EvalSetRecord = InferSelectModel<typeof evalSets>;

export async function createEvalSet(
  db: Database,
  input: Pick<EvalSetRecord, "projectId" | "name">,
): Promise<EvalSetRecord> {
  const [evalSet] = await db
    .insert(evalSets)
    .values({
      id: randomUUID(),
      ...input,
      status: "draft",
    })
    .returning();

  return evalSet;
}

export async function transitionEvalSetStatus(
  db: Database,
  evalSetId: string,
  nextStatus: Exclude<EvalSetStatus, "draft">,
): Promise<EvalSetRecord> {
  return db.transaction(async (tx) => {
    const [current] = await tx
      .select()
      .from(evalSets)
      .where(eq(evalSets.id, evalSetId))
      .limit(1);

    if (!current) {
      throw new Error(`Eval set ${evalSetId} was not found.`);
    }

    validateEvalSetTransition(
      current.status as "draft" | "frozen" | "retired",
      nextStatus,
    );

    const [updated] = await tx
      .update(evalSets)
      .set({
        status: nextStatus === "retired" ? "frozen" : nextStatus,
        updatedAt: new Date(),
      })
      .where(eq(evalSets.id, evalSetId))
      .returning();

    return updated;
  });
}

export async function getLatestProject(db: Database): Promise<ProjectRecord | null> {
  const [project] = await db
    .select()
    .from(projects)
    .orderBy(desc(projects.createdAt))
    .limit(1);

  return project ?? null;
}

export async function getProjectBySlug(
  db: Database,
  slug: string,
): Promise<ProjectRecord | null> {
  const [project] = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
  return project ?? null;
}

export async function ensureProjectExists(
  db: Database,
  slug: string,
): Promise<ProjectRecord> {
  const project = await getProjectBySlug(db, slug);

  if (!project) {
    throw new DomainError(`Project ${slug} does not exist.`, "PROJECT_NOT_FOUND");
  }

  return project;
}
