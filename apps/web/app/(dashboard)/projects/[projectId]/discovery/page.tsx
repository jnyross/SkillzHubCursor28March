"use client";

import { FormEvent, useEffect, useState } from "react";

type ProjectBrief = {
  sourceRequest: string;
  problemStatement: string;
  targetUser: string;
  outputExpectations: string[];
  assumptions: string[];
  openQuestions: string[];
};

type ProjectRecord = {
  id: string;
  name: string;
  slug: string;
  status: string;
  briefJson: ProjectBrief | null;
  briefApprovedAt: string | null;
};

const defaultBrief: ProjectBrief = {
  sourceRequest: "",
  problemStatement: "",
  targetUser: "",
  outputExpectations: [""],
  assumptions: [],
  openQuestions: [],
};

export default function DiscoveryPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const [projectId, setProjectId] = useState<string>("");
  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [brief, setBrief] = useState<ProjectBrief>(defaultBrief);
  const [status, setStatus] = useState<{
    loading: boolean;
    saving: boolean;
    approving: boolean;
    error: string | null;
    notice: string | null;
  }>({
    loading: true,
    saving: false,
    approving: false,
    error: null,
    notice: null,
  });

  async function loadProject(id: string) {
    setStatus((current) => ({ ...current, loading: true, error: null, notice: null }));

    const response = await fetch(`/api/projects/${id}`, {
      cache: "no-store",
    });

    const payload = (await response.json().catch(() => null)) as
      | { project?: ProjectRecord; error?: string; message?: string }
      | null;

    if (!response.ok || !payload?.project) {
      setStatus((current) => ({
        ...current,
        loading: false,
        error: payload?.message ?? payload?.error ?? "Unable to load project.",
      }));
      return;
    }

    setProject(payload.project);
    setBrief(payload.project.briefJson ?? defaultBrief);
    setStatus((current) => ({ ...current, loading: false, error: null }));
  }

  useEffect(() => {
    params.then(({ projectId: resolved }) => {
      setProjectId(resolved);
      void loadProject(resolved);
    });
  }, [params]);

  function updateListField(
    field: "outputExpectations" | "assumptions" | "openQuestions",
    index: number,
    value: string,
  ) {
    setBrief((current) => {
      const next = [...current[field]];
      next[index] = value;
      return {
        ...current,
        [field]: next,
      };
    });
  }

  function addListField(field: "outputExpectations" | "assumptions" | "openQuestions") {
    setBrief((current) => ({
      ...current,
      [field]: [...current[field], ""],
    }));
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!projectId) {
      return;
    }

    setStatus((current) => ({
      ...current,
      saving: true,
      error: null,
      notice: null,
    }));

    const response = await fetch(`/api/projects/${projectId}/discovery`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        ...brief,
        outputExpectations: brief.outputExpectations.filter(Boolean),
        assumptions: brief.assumptions.filter(Boolean),
        openQuestions: brief.openQuestions.filter(Boolean),
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | { project?: ProjectRecord; error?: string; message?: string }
      | null;

    if (!response.ok || !payload?.project) {
      setStatus((current) => ({
        ...current,
        saving: false,
        error: payload?.message ?? payload?.error ?? "Unable to save discovery brief.",
      }));
      return;
    }

    setProject(payload.project);
    setBrief(payload.project.briefJson ?? defaultBrief);
    setStatus((current) => ({
      ...current,
      saving: false,
      notice: "Discovery brief saved.",
    }));
  }

  async function handleApprove() {
    if (!projectId) {
      return;
    }

    setStatus((current) => ({
      ...current,
      approving: true,
      error: null,
      notice: null,
    }));

    const response = await fetch(`/api/projects/${projectId}/discovery/approve`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({}),
    });

    const payload = (await response.json().catch(() => null)) as
      | { project?: ProjectRecord; error?: string; message?: string }
      | null;

    if (!response.ok || !payload?.project) {
      setStatus((current) => ({
        ...current,
        approving: false,
        error: payload?.message ?? payload?.error ?? "Unable to approve discovery brief.",
      }));
      return;
    }

    setProject(payload.project);
    setStatus((current) => ({
      ...current,
      approving: false,
      notice: "Discovery brief approved.",
    }));
  }

  if (status.loading) {
    return <p style={{ color: "#94a3b8" }}>Loading discovery brief…</p>;
  }

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <div style={{ display: "grid", gap: "0.35rem" }}>
        <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Discovery</h2>
        <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.7 }}>
          Capture the source request, intended user, and expected outputs before
          authoring skills and evals.
        </p>
        {project?.briefApprovedAt ? (
          <span style={{ color: "#86efac", fontSize: "0.95rem" }}>
            Approved at {new Date(project.briefApprovedAt).toLocaleString()}
          </span>
        ) : (
          <span style={{ color: "#fbbf24", fontSize: "0.95rem" }}>
            Discovery brief not approved yet.
          </span>
        )}
      </div>

      <form
        onSubmit={handleSave}
        style={{
          display: "grid",
          gap: "1rem",
          padding: "1.25rem",
          borderRadius: "1rem",
          border: "1px solid rgba(148,163,184,0.18)",
          background: "rgba(15,23,42,0.72)",
        }}
      >
        <label style={{ display: "grid", gap: "0.45rem" }}>
          <span>Source request</span>
          <textarea
            value={brief.sourceRequest}
            onChange={(event) =>
              setBrief((current) => ({
                ...current,
                sourceRequest: event.target.value,
              }))
            }
            rows={4}
            style={textareaStyle}
          />
        </label>
        <label style={{ display: "grid", gap: "0.45rem" }}>
          <span>Problem statement</span>
          <textarea
            value={brief.problemStatement}
            onChange={(event) =>
              setBrief((current) => ({
                ...current,
                problemStatement: event.target.value,
              }))
            }
            rows={4}
            style={textareaStyle}
          />
        </label>
        <label style={{ display: "grid", gap: "0.45rem" }}>
          <span>Target user</span>
          <input
            value={brief.targetUser}
            onChange={(event) =>
              setBrief((current) => ({
                ...current,
                targetUser: event.target.value,
              }))
            }
            style={inputStyle}
          />
        </label>

        <ListEditor
          label="Output expectations"
          values={brief.outputExpectations}
          onChange={(index, value) => updateListField("outputExpectations", index, value)}
          onAdd={() => addListField("outputExpectations")}
        />
        <ListEditor
          label="Assumptions"
          values={brief.assumptions}
          onChange={(index, value) => updateListField("assumptions", index, value)}
          onAdd={() => addListField("assumptions")}
        />
        <ListEditor
          label="Open questions"
          values={brief.openQuestions}
          onChange={(index, value) => updateListField("openQuestions", index, value)}
          onAdd={() => addListField("openQuestions")}
        />

        {status.error ? (
          <p style={{ margin: 0, color: "#fca5a5" }}>{status.error}</p>
        ) : null}
        {status.notice ? (
          <p style={{ margin: 0, color: "#86efac" }}>{status.notice}</p>
        ) : null}

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button type="submit" disabled={status.saving} style={primaryButtonStyle}>
            {status.saving ? "Saving…" : "Save brief"}
          </button>
          <button
            type="button"
            onClick={handleApprove}
            disabled={status.approving}
            style={secondaryButtonStyle}
          >
            {status.approving ? "Approving…" : "Approve brief"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ListEditor({
  label,
  values,
  onChange,
  onAdd,
}: {
  label: string;
  values: string[];
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
}) {
  return (
    <div style={{ display: "grid", gap: "0.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
        <span>{label}</span>
        <button type="button" onClick={onAdd} style={inlineButtonStyle}>
          Add item
        </button>
      </div>
      {(values.length ? values : [""]).map((value, index) => (
        <input
          key={`${label}-${index}`}
          value={value}
          onChange={(event) => onChange(index, event.target.value)}
          style={inputStyle}
        />
      ))}
    </div>
  );
}

const inputStyle = {
  borderRadius: "0.75rem",
  border: "1px solid rgba(148,163,184,0.22)",
  background: "rgba(2,6,23,0.6)",
  color: "#f8fafc",
  padding: "0.85rem 1rem",
} satisfies React.CSSProperties;

const textareaStyle = {
  ...inputStyle,
  resize: "vertical" as const,
} satisfies React.CSSProperties;

const primaryButtonStyle = {
  borderRadius: "0.75rem",
  border: 0,
  background: "#2563eb",
  color: "#f8fafc",
  padding: "0.8rem 1rem",
  fontWeight: 600,
  cursor: "pointer",
} satisfies React.CSSProperties;

const secondaryButtonStyle = {
  ...primaryButtonStyle,
  background: "rgba(148,163,184,0.16)",
  border: "1px solid rgba(148,163,184,0.2)",
} satisfies React.CSSProperties;

const inlineButtonStyle = {
  borderRadius: "999px",
  border: "1px solid rgba(148,163,184,0.2)",
  background: "transparent",
  color: "#cbd5e1",
  padding: "0.3rem 0.75rem",
  cursor: "pointer",
} satisfies React.CSSProperties;
