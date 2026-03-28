import { beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";

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

  it("loads the project detail page module", async () => {
    const ProjectDetailPage = (await import("../app/(dashboard)/projects/[projectId]/page")).default;
    expect(ProjectDetailPage).toBeTruthy();
  });

  it("loads the new project page", async () => {
    const NewProjectPage = (await import("../app/(dashboard)/projects/new/page")).default;
    const page = await NewProjectPage();

    expect(page).toBeTruthy();
  });
});
