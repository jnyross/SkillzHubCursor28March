import { describe, expect, it } from "vitest";

describe("project pages", () => {
  it("loads the projects page module", async () => {
    const ProjectsPage = (await import("../app/(dashboard)/projects/page")).default;
    expect(ProjectsPage).toBeTruthy();
  });

  it("loads the project detail page module", async () => {
    const ProjectDetailPage = (await import("../app/(dashboard)/projects/[projectId]/page")).default;
    expect(ProjectDetailPage).toBeTruthy();
  });

  it("loads the new project page module", async () => {
    const NewProjectPage = (await import("../app/(dashboard)/projects/new/page")).default;
    expect(NewProjectPage).toBeTruthy();
  });
});
