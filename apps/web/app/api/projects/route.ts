import { NextResponse } from "next/server";

import { createProjectInputSchema, projectRecordSchema } from "@skill-builder/shared";
import { db, createProject, getLatestProject } from "@skill-builder/db";

import {
  getSessionFromCookieStore,
  requireAuthenticatedRequest,
} from "../../../lib/auth";
import { parseJsonBody } from "../../../lib/api";

export async function GET() {
  await requireAuthenticatedRequest();

  const latestProject = await getLatestProject(db);

  return NextResponse.json({
    ok: true,
    project: latestProject ? projectRecordSchema.parse(latestProject) : null,
  });
}

export async function POST(request: Request) {
  const session = await getSessionFromCookieStore();

  if (!session) {
    return NextResponse.json(
      {
        ok: false,
        error: "UNAUTHORIZED",
      },
      { status: 401 },
    );
  }

  const body = await parseJsonBody(request);
  const parsed = createProjectInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "INVALID_PROJECT_INPUT",
        issues: parsed.error.issues,
      },
      { status: 400 },
    );
  }

  const project = await createProject(db, {
    name: parsed.data.name,
    slug: parsed.data.slug,
    ownerUserId: session.user,
    briefJson: parsed.data.brief ?? null,
  });

  return NextResponse.json(
    {
      ok: true,
      project: projectRecordSchema.parse(project),
    },
    { status: 201 },
  );
}
