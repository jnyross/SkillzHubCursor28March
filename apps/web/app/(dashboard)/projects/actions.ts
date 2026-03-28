"use server";

import { revalidatePath } from "next/cache";

const baseUrl = "http://127.0.0.1:3000";

type ActionState = {
  error: string | null;
  success: string | null;
};

function getCookieHeader(cookie: string | null) {
  const headers = new Headers({
    "content-type": "application/json",
  });

  if (cookie) {
    headers.set("cookie", cookie);
  }

  return headers;
}

export type CreateProjectActionResult =
  | {
      ok: false;
      error: string;
    }
  | {
      ok: true;
      projectId: string;
    };

export async function createProjectAction(
  formData: FormData,
): Promise<CreateProjectActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const cookie = String(formData.get("sessionCookie") ?? "").trim() || null;

  if (!name || !slug) {
    return {
      ok: false,
      error: "Name and slug are required.",
    };
  }

  const response = await fetch(`${baseUrl}/api/projects`, {
    method: "POST",
    headers: getCookieHeader(cookie),
    body: JSON.stringify({ name, slug }),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | { error?: string; project?: { id?: string } }
    | null;

  if (!response.ok) {
    return {
      ok: false,
      error: payload?.error ?? "Unable to create project.",
    };
  }

  revalidatePath("/projects");

  return {
    ok: true,
    projectId: payload?.project?.id ?? "",
  };
}

export async function updateDiscoveryBriefAction(
  cookie: string | null,
  projectId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const payload = {
    sourceRequest: String(formData.get("sourceRequest") ?? "").trim(),
    problemStatement: String(formData.get("problemStatement") ?? "").trim(),
    targetUser: String(formData.get("targetUser") ?? "").trim(),
    outputExpectations: String(formData.get("outputExpectations") ?? "")
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean),
    assumptions: String(formData.get("assumptions") ?? "")
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean),
    openQuestions: String(formData.get("openQuestions") ?? "")
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean),
  };

  const response = await fetch(`${baseUrl}/api/projects/${projectId}/discovery`, {
    method: "PATCH",
    headers: getCookieHeader(cookie),
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const body = (await response.json().catch(() => null)) as { error?: string } | null;

  if (!response.ok) {
    return {
      error: body?.error ?? "Unable to update discovery brief.",
      success: null,
    };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/discovery`);

  return {
    error: null,
    success: "Discovery brief updated.",
  };
}

export async function approveDiscoveryBriefAction(
  cookie: string | null,
  projectId: string,
): Promise<void> {
  await fetch(`${baseUrl}/api/projects/${projectId}/discovery/approve`, {
    method: "POST",
    headers: getCookieHeader(cookie),
    body: JSON.stringify({}),
    cache: "no-store",
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/discovery`);
}
