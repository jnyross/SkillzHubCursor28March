"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type ProjectRecord = {
  id: string;
  name: string;
  slug: string;
  status: string;
  ownerUserId: string;
  briefJson: {
    sourceRequest: string;
    problemStatement: string;
    targetUser: string;
    outputExpectations: string[];
    assumptions: string[];
    openQuestions: string[];
  } | null;
  briefApprovedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type ProjectResponse = {
  ok: boolean;
  project?: ProjectRecord;
  error?: string;
};

const inputStyle = {
  borderRadius: "0.75rem",
  border: "1px solid rgba(148,163,184,0.24)",
  background: "rgba(2,6,23,0.55)",
  color: "#e2e8f0",
  padding: "0.85rem 1rem",
  font: "inherit",
} as const;

export default function ProjectDetailPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;

  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    sourceRequest: "",
    problemStatement: "",
    targetUser: "",
    outputExpectations: "",
    assumptions: "",
    openQuestions: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function loadProject() {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/projects/${projectId}`, {
        cache: "no-store",
      });

      const payload = (await response.json()) as ProjectResponse;

      if (cancelled) {
        return;
      }

      if (!response.ok || !payload.project) {
        setError(payload.error ?? "Unable to load project.");
        setLoading(false);
        return;
      }

      setProject(payload.project);
      setForm({
        name: payload.project.name,
        slug: payload.project.slug,
        sourceRequest: payload.project.briefJson?.sourceRequest ?? "",
        problemStatement: payload.project.briefJson?.problemStatement ?? "",
        targetUser: payload.project.briefJson?.targetUser ?? "",
        outputExpectations: (payload.project.briefJson?.outputExpectations ?? []).join("\n"),
        assumptions: (payload.project.briefJson?.assumptions ?? []).join("\n"),
        openQuestions: (payload.project.briefJson?.openQuestions ?? []).join("\n"),
      });
      setLoading(false);
    }

    void loadProject();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const approved = useMemo(() => Boolean(project?.briefApprovedAt), [project?.briefApprovedAt]);

  async function saveMetadata() {
    setSaving(true);
    setError(null);
    setMessage(null);

    const response = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name: form.name,
        slug: form.slug,
      }),
    });

    const payload = (await response.json()) as ProjectResponse;

    if (!response.ok || !payload.project) {
      setSaving(false);
      setError(payload.error ?? "Unable to save project metadata.");
      return;
    }

    setProject(payload.project);
    setSaving(false);
    setMessage("Project metadata saved.");
  }

  async function saveDiscovery() {
    setSaving(true);
    setError(null);
    setMessage(null);

    const response = await fetch(`/api/projects/${projectId}/discovery`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sourceRequest: form.sourceRequest,
        problemStatement: form.problemStatement,
        targetUser: form.targetUser,
        outputExpectations: form.outputExpectations
          .split("\n")
          .map((value) => value.trim())
          .filter(Boolean),
        assumptions: form.assumptions
          .split("\n")
          .map((value) => value.trim())
          .filter(Boolean),
        openQuestions: form.openQuestions
          .split("\n")
          .map((value) => value.trim())
          .filter(Boolean),
      }),
    });

    const payload = (await response.json()) as ProjectResponse;

    if (!response.ok || !payload.project) {
      setSaving(false);
      setError(payload.error ?? "Unable to save discovery brief.");
      return;
    }

    setProject(payload.project);
    setSaving(false);
    setMessage("Discovery brief saved.");
  }

  async function approveDiscovery() {
    setSaving(true);
    setError(null);
    setMessage(null);

    const response = await fetch(`/api/projects/${projectId}/discovery/approve`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({}),
    });

    const payload = (await response.json()) as ProjectResponse;

    if (!response.ok || !payload.project) {
      setSaving(false);
      setError(payload.error ?? "Unable to approve discovery brief.");
      return;
    }

    setProject(payload.project);
    setSaving(false);
    setMessage("Discovery brief approved.");
  }

  if (loading) {
    return <p style={{ color: "#94a3b8" }}>Loading project…</p>;
  }

  if (error && !project) {
    return (
      <div style={{ display: "grid", gap: "1rem" }}>
        <p style={{ color: "#fca5a5", margin: 0 }}>{error}</p>
        <Link href="/projects" style={{ color: "#93c5fd" }}>
          Back to projects
        </Link>
      </div>
    );
  }

  return (
    <main style={{ display: "grid", gap: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ display: "grid", gap: "0.35rem" }}>
          <h1 style={{ margin: 0, fontSize: "2rem" }}>{project?.name}</h1>
          <span style={{ color: "#94a3b8" }}>/{project?.slug}</span>
        </div>
        <Link
          href="/projects"
          style={{
            width: "fit-content",
            borderRadius: "999px",
            border: "1px solid rgba(148,163,184,0.24)",
            padding: "0.75rem 1rem",
            color: "#e2e8f0",
          }}
        >
          Back to projects
        </Link>
      </div>

      {error ? <p style={{ margin: 0, color: "#fca5a5" }}>{error}</p> : null}
      {message ? <p style={{ margin: 0, color: "#86efac" }}>{message}</p> : null}

      <section
        style={{
          display: "grid",
          gap: "1rem",
          padding: "1.25rem",
          borderRadius: "1rem",
          border: "1px solid rgba(148,163,184,0.18)",
          background: "rgba(15,23,42,0.72)",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Project metadata</h2>
        <label style={{ display: "grid", gap: "0.45rem" }}>
          <span>Name</span>
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            style={inputStyle}
          />
        </label>
        <label style={{ display: "grid", gap: "0.45rem" }}>
          <span>Slug</span>
          <input
            value={form.slug}
            onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
            style={inputStyle}
          />
        </label>
        <button
          type="button"
          onClick={() => void saveMetadata()}
          disabled={saving}
          style={{
            width: "fit-content",
            borderRadius: "0.75rem",
            border: 0,
            padding: "0.85rem 1rem",
            background: "#2563eb",
            color: "#f8fafc",
            cursor: saving ? "progress" : "pointer",
          }}
        >
          Save metadata
        </button>
      </section>

      <section
        style={{
          display: "grid",
          gap: "1rem",
          padding: "1.25rem",
          borderRadius: "1rem",
          border: "1px solid rgba(148,163,184,0.18)",
          background: "rgba(15,23,42,0.72)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Discovery brief</h2>
          <span style={{ color: approved ? "#86efac" : "#fbbf24" }}>
            {approved ? "Approved" : "Draft"}
          </span>
        </div>
        <label style={{ display: "grid", gap: "0.45rem" }}>
          <span>Source request</span>
          <textarea
            value={form.sourceRequest}
            onChange={(event) => setForm((current) => ({ ...current, sourceRequest: event.target.value }))}
            style={{ ...inputStyle, minHeight: "110px" }}
          />
        </label>
        <label style={{ display: "grid", gap: "0.45rem" }}>
          <span>Problem statement</span>
          <textarea
            value={form.problemStatement}
            onChange={(event) => setForm((current) => ({ ...current, problemStatement: event.target.value }))}
            style={{ ...inputStyle, minHeight: "110px" }}
          />
        </label>
        <label style={{ display: "grid", gap: "0.45rem" }}>
          <span>Target user</span>
          <input
            value={form.targetUser}
            onChange={(event) => setForm((current) => ({ ...current, targetUser: event.target.value }))}
            style={inputStyle}
          />
        </label>
        <label style={{ display: "grid", gap: "0.45rem" }}>
          <span>Output expectations — one per line</span>
          <textarea
            value={form.outputExpectations}
            onChange={(event) => setForm((current) => ({ ...current, outputExpectations: event.target.value }))}
            style={{ ...inputStyle, minHeight: "110px" }}
          />
        </label>
        <label style={{ display: "grid", gap: "0.45rem" }}>
          <span>Assumptions — one per line</span>
          <textarea
            value={form.assumptions}
            onChange={(event) => setForm((current) => ({ ...current, assumptions: event.target.value }))}
            style={{ ...inputStyle, minHeight: "110px" }}
          />
        </label>
        <label style={{ display: "grid", gap: "0.45rem" }}>
          <span>Open questions — one per line</span>
          <textarea
            value={form.openQuestions}
            onChange={(event) => setForm((current) => ({ ...current, openQuestions: event.target.value }))}
            style={{ ...inputStyle, minHeight: "110px" }}
          />
        </label>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => void saveDiscovery()}
            disabled={saving}
            style={{
              borderRadius: "0.75rem",
              border: 0,
              padding: "0.85rem 1rem",
              background: "#0f766e",
              color: "#f8fafc",
              cursor: saving ? "progress" : "pointer",
            }}
          >
            Save discovery
          </button>
          <button
            type="button"
            onClick={() => void approveDiscovery()}
            disabled={saving}
            style={{
              borderRadius: "0.75rem",
              border: "1px solid rgba(148,163,184,0.24)",
              padding: "0.85rem 1rem",
              background: approved ? "rgba(134,239,172,0.14)" : "transparent",
              color: "#f8fafc",
              cursor: saving ? "progress" : "pointer",
            }}
          >
            Approve discovery
          </button>
        </div>
      </section>
    </main>
  );
}
