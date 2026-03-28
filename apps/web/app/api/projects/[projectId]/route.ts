import { NextResponse } from "next/server";
import {
  createProjectInputSchema,
  projectBriefSchema,
  updateProjectInputSchema,
} from "@skill-builder/shared";
import { db, getProjectById, updateProject } from "@skill-builder/db";

import { badRequest, serverError } from "../../../../lib/api";
import { requireAuthenticatedSession } from "../../../../lib/auth";

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await requireAuthenticatedSession();
  if (!session.ok) {
    return session.response;
  }

  const { projectId } = await context.params;
  const project = await getProjectById(db, projectId);

  if (!project) {
    return NextResponse.json(
      {
        ok: false,
        error: "PROJECT_NOT_FOUND",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    project,
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireAuthenticatedSession();
  if (!session.ok) {
    return session.response;
  }

  const body = (await request.json().catch(() => null)) as unknown;
  const parsed = updateProjectInputSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest("INVALID_PROJECT_UPDATE", parsed.error.flatten());
  }

  const { projectId } = await context.params;

  try {
    const project = await updateProject(db, projectId, parsed.data);
    return NextResponse.json({
      ok: true,
      project,
    });
  } catch (error) {
    return serverError(error);
  }
}
