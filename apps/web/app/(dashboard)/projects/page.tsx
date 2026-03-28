import Link from "next/link";
import { db, listProjects } from "@skill-builder/db";

export default async function ProjectsPage() {
  const projects = await listProjects(db);
  return (
    <main style={{ display: "grid", gap: "1rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "2rem" }}>Projects</h1>
        <Link
          href="/projects/new"
          style={{
            borderRadius: "999px",
            background: "#2563eb",
            color: "#eff6ff",
            padding: "0.75rem 1rem",
            fontWeight: 600,
          }}
        >
          New project
        </Link>
      </div>
      <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.7 }}>
        Authenticated dashboard shell with local project APIs wired to the host
        Postgres database.
      </p>
      <section
        style={{
          display: "grid",
          gap: "0.75rem",
          padding: "1rem",
          borderRadius: "1rem",
          border: "1px solid rgba(148,163,184,0.18)",
          background: "rgba(15,23,42,0.72)",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.125rem" }}>Projects</h2>
        {projects.length ? (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {projects.map((project) => (
              <article
                key={project.id}
                style={{
                  display: "grid",
                  gap: "0.35rem",
                  borderRadius: "0.85rem",
                  padding: "0.9rem 1rem",
                  border: "1px solid rgba(148,163,184,0.14)",
                  background: "rgba(2,6,23,0.46)",
                }}
              >
                <strong>{project.name}</strong>
                <span style={{ color: "#94a3b8" }}>/{project.slug}</span>
                <span style={{ color: "#cbd5e1" }}>Status: {project.status}</span>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  <Link
                    href={`/projects/${project.id}`}
                    style={{ color: "#93c5fd", fontWeight: 500 }}
                  >
                    Overview
                  </Link>
                  <Link
                    href={`/projects/${project.id}/discovery`}
                    style={{ color: "#93c5fd", fontWeight: 500 }}
                  >
                    Discovery
                  </Link>
                  <Link
                    href={`/projects/${project.id}/skill`}
                    style={{ color: "#93c5fd", fontWeight: 500 }}
                  >
                    Skill
                  </Link>
                  <Link
                    href={`/projects/${project.id}/evals`}
                    style={{ color: "#93c5fd", fontWeight: 500 }}
                  >
                    Evals
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <span style={{ color: "#94a3b8" }}>
            No projects created yet. Use the API to create your first project.
          </span>
        )}
      </section>
      <Link
        href="/"
        style={{
          width: "fit-content",
          borderRadius: "0.75rem",
          border: "1px solid rgba(148,163,184,0.24)",
          padding: "0.8rem 1rem",
          color: "#e2e8f0",
        }}
      >
        Back to bootstrap home
      </Link>
    </main>
  );
}
