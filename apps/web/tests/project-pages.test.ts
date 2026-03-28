import { beforeEach, describe, expect, it, vi } from "vitest";

const listProjects = vi.fn();
const getProjectById = vi.fn();

vi.mock("@skill-builder/db", () => ({
  db: {},
  listProjects: (...args: unknown[]) => listProjects(...args),
  getProjectById: (...args: unknown[]) => getProjectById(...args),
}));

vi.mock("../lib/session", () => ({
  getCurrentSession: vi.fn(async () => ({
    user: "local-admin",
  })),
}));

describe("project pages", () => {
  beforeEach(() => {
    listProjects.mockReset();
    getProjectById.mockReset();
  });

  it("renders the projects index page with data", async () => {
    listProjects.mockResolvedValue([
      {
        id: "proj_123",
        name: "Skill Builder",
        slug: "skill-builder",
        status: "draft",
      },
    ]);

    const ProjectsPage = (await import("../app/(dashboard)/projects/page")).default;
    const page = await ProjectsPage();

    expect(page).toBeTruthy();
    expect(listProjects).toHaveBeenCalled();
  });

  it("loads the project detail page", async () => {
    getProjectById.mockResolvedValue({
      id: "proj_123",
      name: "Skill Builder",
      slug: "skill-builder",
      status: "draft",
      ownerUserId: "local-admin",
      briefJson: null,
      briefApprovedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const ProjectDetailPage = (await import("../app/(dashboard)/projects/[projectId]/page")).default;
    const page = await ProjectDetailPage({
      params: Promise.resolve({ projectId: "proj_123" }),
    });

    expect(page).toBeTruthy();
    expect(getProjectById).toHaveBeenCalled();
  });

  it("loads the new project page", async () => {
    const NewProjectPage = (await import("../app/(dashboard)/projects/new/page")).default;
    const page = await NewProjectPage();

    expect(page).toBeTruthy();
  });
});
