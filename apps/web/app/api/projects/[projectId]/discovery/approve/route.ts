import { NextResponse } from "next/server";

import { approveProjectBrief, db } from "@skill-builder/db";

import {
  jsonError,
  parseJsonBody,
  requireAuthenticatedSession,
} from "../../../../../../lib/api";

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const session = await requireAuthenticatedSession();
  if (!session.ok) {
    return session.response;
  }

  const { projectId } = await context.params;
  const body = await parseJsonBody<{ briefApprovedAt?: string }>(request);

  try {
    const project = await approveProjectBrief(
      db,
      projectId,
      body?.briefApprovedAt ? new Date(body.briefApprovedAt) : undefined,
    );

    return NextResponse.json({
      ok: true,
      project,
      approvedBy: session.user,
    });
  } catch (error) {
    return jsonError(error);
  }
}
