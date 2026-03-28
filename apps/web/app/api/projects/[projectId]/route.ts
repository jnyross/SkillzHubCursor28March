import { NextResponse } from "next/server";
import { db, getProjectById, updateProject } from "@skill-builder/db";
import { projectRecordSchema, updateProjectInputSchema } from "@skill-builder/shared";

import { badRequest, notFound, parseJsonBody, unauthorized } from "../../../../lib/api";
import { getCurrentSession } from "../../../../lib/session";

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await getCurrentSession();
  if (!session) {
    return unauthorized();
  }

  const { projectId } = await context.params;
  const project = await getProjectById(db, projectId);

  if (!project) {
    return notFound("PROJECT_NOT_FOUND", "Project not found.");
  }

  return NextResponse.json({
    ok: true,
    project: projectRecordSchema.parse(project),
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getCurrentSession();
  if (!session) {
    return unauthorized();
  }

  const parsed = await parseJsonBody(request, updateProjectInputSchema);
  if (!parsed.success) {
    return parsed.response;
  }

  const { projectId } = await context.params;

  try {
    const project = await updateProject(db, projectId, parsed.data);

    return NextResponse.json({
      ok: true,
      project: projectRecordSchema.parse(project),
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("does not exist")) {
      return notFound("PROJECT_NOT_FOUND", error.message);
    }

    return badRequest("INVALID_PROJECT_UPDATE", error);
  }
}
