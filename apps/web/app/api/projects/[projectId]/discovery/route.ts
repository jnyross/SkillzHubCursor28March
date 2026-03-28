import { NextResponse } from "next/server";

import { db } from "@skill-builder/db";
import { projectBriefSchema, updateProjectInputSchema } from "@skill-builder/shared";

import { badRequest, notFound } from "../../../../../lib/api";
import { getSessionFromCookieStore } from "../../../../../lib/auth";

interface DiscoveryRouteContext {
  params: Promise<{
    projectId: string;
  }>;
}

export async function PATCH(request: Request, context: DiscoveryRouteContext) {
  const session = await getSessionFromCookieStore();
  if (!session) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateProjectInputSchema.pick({ brief: true }).safeParse(body);

  if (!parsed.success || !parsed.data.brief) {
    return badRequest("Brief payload is invalid.");
  }

  const { projectId } = await context.params;

  const [project] = await db
    .update(db._.fullSchema.projects)
    .set({
      briefJson: projectBriefSchema.parse(parsed.data.brief),
      updatedAt: new Date(),
    })
    .where(db._.dialect.sqlToQuery ? undefined : undefined);

  void project;

  return notFound("Project discovery update will be implemented with typed repository support next.");
}
