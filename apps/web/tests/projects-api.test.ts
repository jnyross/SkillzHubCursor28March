import { beforeEach, describe, expect, it, vi } from "vitest";

const createProject = vi.fn();
const getProjectById = vi.fn();
const getLatestProject = vi.fn();
const listProjects = vi.fn();
const updateProject = vi.fn();
const approveProjectBrief = vi.fn();
const getSessionFromCookies = vi.fn();
const getCurrentSession = vi.fn();
const requireAuthenticatedRequest = vi.fn();
const requireAuthenticatedSession = vi.fn();

vi.mock("@skill-builder/db", () => ({
  db: {},
  createProject: (...args: unknown[]) => createProject(...args),
  getProjectById: (...args: unknown[]) => getProjectById(...args),
  getLatestProject: (...args: unknown[]) => getLatestProject(...args),
  listProjects: (...args: unknown[]) => listProjects(...args),
  updateProject: (...args: unknown[]) => updateProject(...args),
  approveProjectBrief: (...args: unknown[]) => approveProjectBrief(...args),
}));

vi.mock("../lib/auth", () => ({
  requireAuthenticatedRequest: (...args: unknown[]) => requireAuthenticatedRequest(...args),
  requireAuthenticatedSession: (...args: unknown[]) => requireAuthenticatedSession(...args),
}));

vi.mock("../lib/session", () => ({
  getSessionFromCookies: (...args: unknown[]) => getSessionFromCookies(...args),
  getCurrentSession: (...args: unknown[]) => getCurrentSession(...args),
}));

describe("project api routes", () => {
  beforeEach(() => {
    createProject.mockReset();
    getProjectById.mockReset();
    getLatestProject.mockReset();
    listProjects.mockReset();
    updateProject.mockReset();
    approveProjectBrief.mockReset();
    getSessionFromCookies.mockReset();
    getCurrentSession.mockReset();
    requireAuthenticatedRequest.mockReset();
    requireAuthenticatedSession.mockReset();

    getSessionFromCookies.mockResolvedValue({
      user: "local-admin",
    });
    getCurrentSession.mockResolvedValue({
      user: "local-admin",
    });
    requireAuthenticatedRequest.mockResolvedValue({
      ok: true,
      session: {
        user: "local-admin",
      },
    });
    requireAuthenticatedSession.mockResolvedValue({
      ok: true,
      session: {
        user: "local-admin",
      },
    });
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

  it("returns the latest project from GET /api/projects", async () => {
    const createdAt = new Date().toISOString();
    getLatestProject.mockResolvedValue({
      id: "proj_latest",
      name: "Latest Project",
      slug: "latest-project",
      status: "draft",
      ownerUserId: "local-admin",
      briefJson: null,
      briefApprovedAt: null,
      createdAt,
      updatedAt: createdAt,
    });
    listProjects.mockResolvedValue([
      {
        id: "proj_latest",
        name: "Latest Project",
        slug: "latest-project",
        status: "draft",
        ownerUserId: "local-admin",
        briefJson: null,
        briefApprovedAt: null,
        createdAt,
        updatedAt: createdAt,
      },
    ]);

    const { GET } = await import("../app/api/projects/route");
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      latestProject: {
        slug: "latest-project",
      },
      projects: [
        {
          slug: "latest-project",
        },
      ],
    });
    expect(getSessionFromCookies).toHaveBeenCalled();
  });

  it("updates project discovery details", async () => {
    const updatedAt = new Date().toISOString();
    updateProject.mockResolvedValue({
      id: "proj_123",
      name: "Skill Builder",
      slug: "skill-builder",
      status: "draft",
      ownerUserId: "local-admin",
      briefJson: {
        sourceRequest: "Create a skill builder",
        problemStatement: "Automate skill iteration",
        targetUser: "internal users",
        outputExpectations: ["paired results"],
        assumptions: [],
        openQuestions: [],
      },
      briefApprovedAt: null,
      createdAt: updatedAt,
      updatedAt,
    });

    const { PATCH } = await import("../app/api/projects/[projectId]/discovery/route");
    const response = await PATCH(
      new Request("http://127.0.0.1:3000/api/projects/proj_123/discovery", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sourceRequest: "Create a skill builder",
          problemStatement: "Automate skill iteration",
          targetUser: "internal users",
          outputExpectations: ["paired results"],
        }),
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
    expect(updateProject).toHaveBeenCalledWith(
      {},
      "proj_123",
      expect.objectContaining({
        briefJson: expect.objectContaining({
          targetUser: "internal users",
        }),
      }),
    );
  });

  it("approves a project brief", async () => {
    const approvedAt = new Date().toISOString();
    approveProjectBrief.mockResolvedValue({
      id: "proj_123",
      name: "Skill Builder",
      slug: "skill-builder",
      status: "draft",
      ownerUserId: "local-admin",
      briefJson: {
        sourceRequest: "Create a skill builder",
        problemStatement: "Automate skill iteration",
        targetUser: "internal users",
        outputExpectations: ["paired results"],
        assumptions: [],
        openQuestions: [],
      },
      briefApprovedAt: approvedAt,
      createdAt: approvedAt,
      updatedAt: approvedAt,
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
        briefApprovedAt: approvedAt,
      },
    });
    expect(approveProjectBrief).toHaveBeenCalledWith({}, "proj_123");
  });
});
