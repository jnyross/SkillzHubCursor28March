import { NextResponse } from "next/server";

import { createProjectInputSchema, projectRecordSchema } from "@skill-builder/shared";
import { createProject, db, getLatestProject, listProjects } from "@skill-builder/db";

import { parseJsonBody, unauthorized, unwrapParsedBody } from "../../../lib/api";
import { getSessionFromCookies } from "../../../lib/session";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return unauthorized();
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
  const session = await getSessionFromCookies();
  if (!session) {
    return unauthorized();
  }

  const parsed = await parseJsonBody(request, createProjectInputSchema);
  if (!unwrapParsedBody(parsed)) {
    return parsed.response;
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
