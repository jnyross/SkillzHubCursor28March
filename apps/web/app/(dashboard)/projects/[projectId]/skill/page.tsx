"use client";

import { useMemo, useState } from "react";

type SkillFileDraft = {
  path: string;
  kind: "skill_md" | "script" | "reference" | "asset";
  content: string;
};

const defaultSkillMarkdown = `---
name: skill-builder-example
description: Helps Claude build and evaluate internal skills consistently.
---

# Purpose

Describe the problem this skill solves.

# When to Use

- Use this skill when you need repeatable skill authoring guidance.

# Instructions

1. Review the user request.
2. Follow the documented workflow.
3. Produce artifacts and evidence.
`;

export default function ProjectSkillPage() {
  const [frontmatterName, setFrontmatterName] = useState("skill-builder-example");
  const [frontmatterDescription, setFrontmatterDescription] = useState(
    "Helps Claude build and evaluate internal skills consistently.",
  );
  const [skillMarkdown, setSkillMarkdown] = useState(defaultSkillMarkdown);
  const [files, setFiles] = useState<SkillFileDraft[]>([
    {
      path: "SKILL.md",
      kind: "skill_md",
      content: defaultSkillMarkdown,
    },
  ]);

  const fileSummary = useMemo(
    () =>
      files.map((file) => `${file.kind}: ${file.path}`).join("\n") ||
      "No bundled files configured yet.",
    [files],
  );

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <section
        style={{
          display: "grid",
          gap: "0.75rem",
          borderRadius: "1rem",
          border: "1px solid rgba(148,163,184,0.18)",
          background: "rgba(15,23,42,0.72)",
          padding: "1rem 1.1rem",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.75rem" }}>Skill authoring</h1>
        <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.7 }}>
          Phase 3 focuses on a functional authoring surface. This page keeps the
          draft state local for now while the skill CRUD APIs are still queued in
          the plan.
        </p>
      </section>

      <section
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        }}
      >
        <div
          style={{
            display: "grid",
            gap: "0.85rem",
            borderRadius: "1rem",
            border: "1px solid rgba(148,163,184,0.18)",
            background: "rgba(15,23,42,0.72)",
            padding: "1rem 1.1rem",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Frontmatter</h2>
          <label style={{ display: "grid", gap: "0.35rem" }}>
            <span style={{ color: "#cbd5e1" }}>Name</span>
            <input
              value={frontmatterName}
              onChange={(event) => setFrontmatterName(event.target.value)}
              style={{
                borderRadius: "0.75rem",
                border: "1px solid rgba(148,163,184,0.24)",
                background: "rgba(2,6,23,0.5)",
                color: "#f8fafc",
                padding: "0.75rem 0.85rem",
              }}
            />
          </label>
          <label style={{ display: "grid", gap: "0.35rem" }}>
            <span style={{ color: "#cbd5e1" }}>Description</span>
            <textarea
              value={frontmatterDescription}
              onChange={(event) => setFrontmatterDescription(event.target.value)}
              rows={5}
              style={{
                borderRadius: "0.75rem",
                border: "1px solid rgba(148,163,184,0.24)",
                background: "rgba(2,6,23,0.5)",
                color: "#f8fafc",
                padding: "0.75rem 0.85rem",
                resize: "vertical",
              }}
            />
          </label>
        </div>

        <div
          style={{
            display: "grid",
            gap: "0.85rem",
            borderRadius: "1rem",
            border: "1px solid rgba(148,163,184,0.18)",
            background: "rgba(15,23,42,0.72)",
            padding: "1rem 1.1rem",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Bundled files</h2>
          <pre
            style={{
              margin: 0,
              minHeight: "10rem",
              borderRadius: "0.75rem",
              border: "1px solid rgba(148,163,184,0.18)",
              background: "rgba(2,6,23,0.56)",
              padding: "0.9rem",
              color: "#cbd5e1",
              whiteSpace: "pre-wrap",
            }}
          >
            {fileSummary}
          </pre>
          <button
            type="button"
            onClick={() =>
              setFiles((current) => [
                ...current,
                {
                  path: `references/reference-${current.length}.md`,
                  kind: "reference",
                  content: "# New reference\n\nAdd supporting material here.",
                },
              ])
            }
            style={{
              width: "fit-content",
              borderRadius: "999px",
              border: "1px solid rgba(148,163,184,0.2)",
              background: "transparent",
              color: "#e2e8f0",
              padding: "0.7rem 1rem",
              cursor: "pointer",
            }}
          >
            Add reference file
          </button>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gap: "0.75rem",
          borderRadius: "1rem",
          border: "1px solid rgba(148,163,184,0.18)",
          background: "rgba(15,23,42,0.72)",
          padding: "1rem 1.1rem",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.1rem" }}>SKILL.md draft</h2>
        <textarea
          value={skillMarkdown}
          onChange={(event) => {
            const nextValue = event.target.value;
            setSkillMarkdown(nextValue);
            setFiles((current) =>
              current.map((file) =>
                file.path === "SKILL.md"
                  ? {
                      ...file,
                      content: nextValue,
                    }
                  : file,
              ),
            );
          }}
          rows={20}
          style={{
            width: "100%",
            borderRadius: "0.9rem",
            border: "1px solid rgba(148,163,184,0.22)",
            background: "rgba(2,6,23,0.58)",
            color: "#f8fafc",
            padding: "1rem",
            fontFamily:
              'ui-monospace, SFMono-Regular, SFMono, Menlo, Consolas, "Liberation Mono", monospace',
            fontSize: "0.95rem",
            lineHeight: 1.6,
            resize: "vertical",
          }}
        />
        <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.92rem" }}>
          Functional placeholder: editing is local-only until the skill APIs are
          implemented in the next slice of the plan.
        </p>
      </section>
    </div>
  );
}
