import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { createProjectAction } from "../actions";

export default function NewProjectPage() {
  async function submit(formData: FormData) {
    "use server";

    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();
    const result = await createProjectAction(cookieHeader || null, formData);

    if (!result.error) {
      redirect("/projects");
    }
  }

  return (
    <main
      style={{
        maxWidth: "780px",
        margin: "0 auto",
        padding: "2rem 1.5rem 3rem",
        display: "grid",
        gap: "1.5rem",
      }}
    >
      <div style={{ display: "grid", gap: "0.5rem" }}>
        <h1 style={{ margin: 0, fontSize: "2rem" }}>Create project</h1>
        <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.7 }}>
          Start a new skill-building project by defining a name, slug, and optional initial discovery brief.
        </p>
      </div>

      <form
        action={submit}
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
          <span>Name</span>
          <input
            name="name"
            required
            placeholder="Skill Builder"
            style={{
              borderRadius: "0.75rem",
              border: "1px solid rgba(255,255,255,0.14)",
              padding: "0.85rem 1rem",
              background: "#07131d",
              color: "#f8fafc",
            }}
          />
        </label>

        <label style={{ display: "grid", gap: "0.45rem" }}>
          <span>Slug</span>
          <input
            name="slug"
            required
            pattern="^[a-z0-9-]+$"
            placeholder="skill-builder"
            style={{
              borderRadius: "0.75rem",
              border: "1px solid rgba(255,255,255,0.14)",
              padding: "0.85rem 1rem",
              background: "#07131d",
              color: "#f8fafc",
            }}
          />
        </label>

        <label style={{ display: "grid", gap: "0.45rem" }}>
          <span>Source request</span>
          <textarea
            name="sourceRequest"
            rows={4}
            placeholder="Describe the skill request or problem space."
            style={{
              borderRadius: "0.9rem",
              border: "1px solid rgba(255,255,255,0.14)",
              padding: "0.9rem 1rem",
              background: "#07131d",
              color: "#f8fafc",
              resize: "vertical",
            }}
          />
        </label>

        <button
          type="submit"
          style={{
            width: "fit-content",
            border: 0,
            borderRadius: "0.85rem",
            padding: "0.9rem 1.2rem",
            background: "#2563eb",
            color: "#f8fafc",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Create project
        </button>
      </form>
    </main>
  );
}
