import type { ReactNode } from "react";
import Link from "next/link";

type ProjectLayoutProps = {
  children: ReactNode;
  params: Promise<{
    projectId: string;
  }>;
};

const tabs = [
  { segment: "", label: "Overview" },
  { segment: "/discovery", label: "Discovery" },
  { segment: "/skill", label: "Skill" },
  { segment: "/evals", label: "Evals" },
];

export default async function ProjectLayout({
  children,
  params,
}: ProjectLayoutProps) {
  const { projectId } = await params;

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "1.5rem",
        display: "grid",
        gap: "1.25rem",
      }}
    >
      <div style={{ display: "grid", gap: "0.35rem" }}>
        <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.95rem" }}>
          Project shell
        </p>
        <h1 style={{ margin: 0, fontSize: "2rem" }}>{projectId}</h1>
      </div>

      <nav
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          borderBottom: "1px solid rgba(148,163,184,0.16)",
          paddingBottom: "0.9rem",
        }}
      >
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={`/projects/${projectId}${tab.segment}`}
            style={{
              borderRadius: "999px",
              border: "1px solid rgba(148,163,184,0.22)",
              padding: "0.6rem 0.95rem",
              color: "#e2e8f0",
              fontSize: "0.95rem",
            }}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
