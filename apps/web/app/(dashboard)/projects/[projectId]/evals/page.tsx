import Link from "next/link";

import { getProjectById } from "@skill-builder/db";
import { db } from "@skill-builder/db";

interface EvalPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function ProjectEvalsPage({ params }: EvalPageProps) {
  const { projectId } = await params;
  const project = await getProjectById(db, projectId);

  if (!project) {
    return (
      <main style={{ display: "grid", gap: "1rem" }}>
        <h1 style={{ margin: 0, fontSize: "1.8rem" }}>Project not found</h1>
        <p style={{ margin: 0, color: "#94a3b8" }}>
          The requested project does not exist in the current local database.
        </p>
        <Link href="/projects" style={{ color: "#7dd3fc" }}>
          Back to projects
        </Link>
      </main>
    );
  }

  return (
    <main style={{ display: "grid", gap: "1rem" }}>
      <header style={{ display: "grid", gap: "0.35rem" }}>
        <h1 style={{ margin: 0, fontSize: "1.8rem" }}>Evals</h1>
        <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.7 }}>
          Phase 3 eval authoring scaffold for <strong>{project.name}</strong>.
          API-backed eval CRUD will be added after the remaining UI scaffolds are
          in place.
        </p>
      </header>

      <section
        style={{
          display: "grid",
          gap: "0.75rem",
          borderRadius: "1rem",
          border: "1px solid rgba(148,163,184,0.18)",
          background: "rgba(15,23,42,0.72)",
          padding: "1rem",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.05rem" }}>Planned eval builder</h2>
        <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "#cbd5e1", lineHeight: 1.7 }}>
          <li>Create and name eval sets per project</li>
          <li>Add eval cases with prompts, expected output, and files</li>
          <li>Attach assertions for the initial built-in assertion types</li>
          <li>Freeze eval sets before launching iterations</li>
        </ul>
      </section>
    </main>
  );
}
