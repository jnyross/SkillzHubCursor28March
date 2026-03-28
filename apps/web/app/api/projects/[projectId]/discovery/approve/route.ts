import { NextResponse } from "next/server";
import { z } from "zod";

import { approveProjectBrief, db } from "@skill-builder/db";

import { jsonError } from "../../../../../../lib/api";
import { requireAuthenticatedSession } from "../../../../../../lib/auth";

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
  const body = (await request.json().catch(() => ({}))) as { briefApprovedAt?: string };
  const parsed = z
    .object({
      briefApprovedAt: z.string().datetime().optional(),
    })
    .safeParse(body);

  if (!parsed.success) {
    return jsonError("INVALID_PAYLOAD", "The request payload is invalid.", 400, parsed.error.flatten());
  }

  try {
    const project = await approveProjectBrief(db, projectId);

    return NextResponse.json({
      ok: true,
      project,
      approvedBy: session.session.user,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("does not exist")) {
      return jsonError("PROJECT_NOT_FOUND", error.message, 404);
    }

    return jsonError("INTERNAL_ERROR", "Unexpected server error.", 500);
  }
}
