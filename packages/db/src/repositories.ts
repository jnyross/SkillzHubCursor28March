import {
  and,
  desc,
  eq,
  isNull,
  type InferInsertModel,
  type InferSelectModel,
} from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import {
  type EvalSetStatus,
  type SkillVersionStatus,
  assertAllowedTransition,
  evalSetTransitions,
  skillVersionTransitions,
} from "@skill-builder/shared";

import {
  projects,
  skills,
  skillVersions,
  evalSets,
  type schema,
} from "./schema";

type Database = NodePgDatabase<typeof schema>;

export type ProjectRecord = InferSelectModel<typeof projects>;
export type CreateProjectInput = Pick<
  InferInsertModel<typeof projects>,
  "name" | "slug" | "ownerUserId" | "briefJson"
>;

export async function createProject(
  db: Database,
  input: CreateProjectInput,
): Promise<ProjectRecord> {
  const [project] = await db
    .insert(projects)
    .values({
      ...input,
      status: "draft",
    })
    .returning();

  return project;
}

export type SkillRecord = InferSelectModel<typeof skills>;

export async function createSkill(
  db: Database,
  input: Pick<InferInsertModel<typeof skills>, "projectId" | "name" | "slug">,
): Promise<SkillRecord> {
  const [skill] = await db.insert(skills).values(input).returning();
  return skill;
}

export type SkillVersionRecord = InferSelectModel<typeof skillVersions>;

export async function createDraftSkillVersion(
  db: Database,
  input: Pick<
    InferInsertModel<typeof skillVersions>,
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
  nextStatus: SkillVersionStatus,
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

    assertAllowedTransition("SkillVersion", skillVersionTransitions, current.status, nextStatus);

    if (nextStatus === "accepted") {
      const [existingAccepted] = await tx
        .select()
        .from(skillVersions)
        .where(
          and(
            eq(skillVersions.skillId, current.skillId),
            eq(skillVersions.status, "accepted"),
            isNull(skillVersions.acceptedAt),
          ),
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
        acceptedAt: nextStatus === "accepted" ? new Date() : current.acceptedAt,
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
  input: Pick<InferInsertModel<typeof evalSets>, "projectId" | "name">,
): Promise<EvalSetRecord> {
  const [evalSet] = await db
    .insert(evalSets)
    .values({
      ...input,
      status: "draft",
    })
    .returning();

  return evalSet;
}

export async function transitionEvalSetStatus(
  db: Database,
  evalSetId: string,
  nextStatus: EvalSetStatus,
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

    assertAllowedTransition("EvalSet", evalSetTransitions, current.status, nextStatus);

    const [updated] = await tx
      .update(evalSets)
      .set({
        status: nextStatus,
        frozenAt: nextStatus === "frozen" ? new Date() : current.frozenAt,
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
