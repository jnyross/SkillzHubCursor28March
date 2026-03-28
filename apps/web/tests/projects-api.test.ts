import { beforeEach, describe, expect, it, vi } from "vitest";

const createProject = vi.fn();
const getProjectById = vi.fn();
const getProjectBySlug = vi.fn();
const updateProject = vi.fn();
const approveProjectBrief = vi.fn();

vi.mock("@skill-builder/db", () => ({
  db: {},
  createProject: (...args: unknown[]) => createProject(...args),
  getProjectById: (...args: unknown[]) => getProjectById(...args),
  getProjectBySlug: (...args: unknown[]) => getProjectBySlug(...args),
  updateProject: (...args: unknown[]) => updateProject(...args),
  approveProjectBrief: (...args: unknown[]) => approveProjectBrief(...args),
}));

vi.mock("../lib/auth", () => ({
  requireAuthenticatedSession: vi.fn(async () => ({
    user: "local-admin",
  })),
}));

describe("project api routes", () => {
  beforeEach(() => {
    createProject.mockReset();
    getProjectById.mockReset();
    getProjectBySlug.mockReset();
    updateProject.mockReset();
    approveProjectBrief.mockReset();
  });

  it("creates a project with validated input", async () => {
    const createdAt = new Date().toISOString();
    createProject.mockResolvedValue({
      id: "proj_123",
      name: "Skill Builder",
      slug: "skill-builder",
      status: "draft",
      ownerUserId: "local-admin",
      briefJson: null,
      briefApprovedAt: null,
      createdAt,
      updatedAt: createdAt,
    });

    const { POST } = await import("../app/api/projects/route");
    const response = await POST(
      new Request("http://127.0.0.1:3000/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "Skill Builder",
          slug: "skill-builder",
        }),
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      project: {
        slug: "skill-builder",
      },
    });
    expect(createProject).toHaveBeenCalled();
  });

  it("approves a project brief", async () => {
    approveProjectBrief.mockResolvedValue({
      id: "proj_123",
      briefApprovedAt: new Date().toISOString(),
    });

    const { POST } = await import("../app/api/projects/[projectId]/discovery/approve/route");
    const response = await POST(
      new Request("http://127.0.0.1:3000/api/projects/proj_123/discovery/approve", {
        method: "POST",
      }),
      {
        params: Promise.resolve({ projectId: "proj_123" }),
      },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      project: {
        id: "proj_123",
      },
    });
    expect(approveProjectBrief).toHaveBeenCalled();
  });
});
