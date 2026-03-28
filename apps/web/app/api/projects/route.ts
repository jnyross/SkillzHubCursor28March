import { NextResponse } from "next/server";

import { createProjectInputSchema, projectRecordSchema } from "@skill-builder/shared";
import { createProject, db, getLatestProject, listProjects } from "@skill-builder/db";

import { jsonError, parseJsonBody } from "../../../lib/api";
import { requireAuthenticatedRequest } from "../../../lib/auth";

export async function GET() {
  const session = await requireAuthenticatedRequest();
  if (!session.ok) {
    return session.response;
  }

  const [latestProject, projects] = await Promise.all([
    getLatestProject(db),
    listProjects(db),
  ]);

  return NextResponse.json({
    ok: true,
    latestProject: latestProject ? projectRecordSchema.parse(latestProject) : null,
    projects: projects.map((project) => projectRecordSchema.parse(project)),
  });
}

export async function POST(request: Request) {
  const session = await requireAuthenticatedRequest();
  if (!session.ok) {
    return session.response;
  }

  const parsed = await parseJsonBody(request, createProjectInputSchema);
  if (!parsed.success) {
    return jsonError("INVALID_PROJECT_INPUT", "Project payload is invalid.", 400, parsed.error);
  }

  const project = await createProject(db, {
    name: parsed.data.name,
    slug: parsed.data.slug,
    ownerUserId: session.session.user,
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
