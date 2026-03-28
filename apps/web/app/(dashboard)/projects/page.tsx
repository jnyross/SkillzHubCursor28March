import Link from "next/link";

export default function ProjectsPage() {
  return (
    <main style={{ display: "grid", gap: "1rem" }}>
      <h1 style={{ margin: 0, fontSize: "2rem" }}>Projects</h1>
      <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.7 }}>
        Phase 2 adds the authenticated dashboard shell. Project CRUD routes are
        the next step in execution.
      </p>
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
