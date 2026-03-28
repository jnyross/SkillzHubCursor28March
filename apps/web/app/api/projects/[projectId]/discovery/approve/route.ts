import { NextResponse } from "next/server";

import { db } from "@skill-builder/db";

import { jsonError, parseJsonBody, requireAuthenticatedRequest } from "../../../../../../lib/api";

export async function POST(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  try {
    const session = await requireAuthenticatedRequest();
    const { projectId } = await context.params;
    const body = await parseJsonBody<{ briefApprovedAt?: string }>(request);

    const [project] = await db
      .update((await import("@skill-builder/db")).projects)
      .set({
        briefApprovedAt: body?.briefApprovedAt
          ? new Date(body.briefApprovedAt)
          : new Date(),
        updatedAt: new Date(),
      })
      .where((await import("drizzle-orm")).eq((await import("@skill-builder/db")).projects.id, projectId))
      .returning();

    if (!project) {
      return jsonError("PROJECT_NOT_FOUND", "Project not found.", 404);
    }

    return NextResponse.json({
      ok: true,
      project,
      approvedBy: session.user,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return jsonError("UNAUTHORIZED", "Authentication required.", 401);
    }

    if (error instanceof Error && error.message === "INVALID_JSON") {
      return jsonError("INVALID_JSON", "Request body must be valid JSON.", 400);
    }

    return jsonError("INTERNAL_ERROR", "Unexpected server error.", 500);
  }
}
