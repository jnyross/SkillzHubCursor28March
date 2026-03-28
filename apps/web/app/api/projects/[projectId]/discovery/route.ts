import { NextResponse } from "next/server";

import { db, getProjectById, updateProject } from "@skill-builder/db";
import { projectBriefSchema, projectRecordSchema } from "@skill-builder/shared";

import {
  notFound,
  parseJsonBody,
  unauthorized,
  serverError,
  unwrapParsedBody,
} from "../../../../../lib/api";
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

  const body = await request.json().catch(() => null);
  const parsed = projectBriefSchema.safeParse(body);

  if (!parsed.success) {
    return serverError(parsed.error);
  }

  const { projectId } = await context.params;
  const project = await getProjectById(db, projectId);

  if (!project) {
    return notFound("PROJECT_NOT_FOUND", "Project not found.");
  }

  try {
    const updated = await updateProject(db, projectId, {
      briefJson: parsed.data as unknown as Record<string, unknown>,
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
