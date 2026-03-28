import { NextResponse } from "next/server";

import { db, getProjectById, updateProject } from "@skill-builder/db";
import { projectBriefSchema, projectRecordSchema } from "@skill-builder/shared";

import { notFound, parseJsonBody, unauthorized, serverError } from "../../../../../lib/api";
import { getCurrentSession } from "../../../../../lib/session";

interface DiscoveryRouteContext {
  params: Promise<{
    projectId: string;
  }>;
}

export async function PATCH(request: Request, context: DiscoveryRouteContext) {
  const session = await getCurrentSession();
  if (!session) {
    return unauthorized();
  }

  const brief = await parseJsonBody(request, projectBriefSchema);
  if (!brief.success) {
    return brief.response;
  }

  const { projectId } = await context.params;
  const project = await getProjectById(db, projectId);

  if (!project) {
    return notFound("PROJECT_NOT_FOUND", "Project not found.");
  }

  try {
    const updated = await updateProject(db, projectId, {
      briefJson: brief.data,
      briefApprovedAt: null,
    });

    return NextResponse.json({
      ok: true,
      project: projectRecordSchema.parse(updated),
    });
  } catch (error) {
    return serverError(error);
  }
}
