import { NextResponse } from "next/server";

import { db, getProjectById, updateProject } from "@skill-builder/db";
import { projectBriefSchema } from "@skill-builder/shared";

import { badRequest, serverError } from "../../../../../lib/api";
import { requireAuthenticatedSession } from "../../../../../lib/auth";

interface DiscoveryRouteContext {
  params: Promise<{
    projectId: string;
  }>;
}

export async function PATCH(request: Request, context: DiscoveryRouteContext) {
  const session = await requireAuthenticatedSession();
  if (!session.ok) {
    return session.response;
  }

  const body = await request.json().catch(() => null);
  const parsed = projectBriefSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest("INVALID_PROJECT_BRIEF", parsed.error.flatten());
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

  try {
    const updated = await updateProject(db, projectId, {
      briefJson: parsed.data,
      briefApprovedAt: null,
    });

    return NextResponse.json({
      ok: true,
      project: updated,
    });
  } catch (error) {
    return serverError(error);
  }
}
