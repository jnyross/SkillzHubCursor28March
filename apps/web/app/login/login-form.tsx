"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

type LoginState = {
  error: string | null;
  pending: boolean;
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = useMemo(
    () => searchParams.get("redirectTo") || "/",
    [searchParams],
  );

  const [password, setPassword] = useState("");
  const [state, setState] = useState<LoginState>({
    error: null,
    pending: false,
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ error: null, pending: true });

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        password,
        redirectTo,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      setState({
        error: payload?.error ?? "Login failed.",
        pending: false,
      });
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        width: "min(100%, 420px)",
        display: "grid",
        gap: "1rem",
        padding: "1.5rem",
        borderRadius: "1rem",
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(13, 28, 43, 0.82)",
      }}
    >
      <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Local login</h1>
      <p style={{ margin: 0, color: "#a3b1c2", lineHeight: 1.6 }}>
        Enter the password configured in <code>APP_LOCAL_PASSWORD</code> to
        unlock the internal tool.
      </p>
      <label style={{ display: "grid", gap: "0.5rem" }}>
        <span>Password</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Configured via APP_LOCAL_PASSWORD"
          style={{
            borderRadius: "0.75rem",
            border: "1px solid rgba(255,255,255,0.16)",
            background: "#07131d",
            color: "#f5f7fb",
            padding: "0.875rem 1rem",
          }}
        />
      </label>
      {state.error ? (
        <p
          style={{
            margin: 0,
            color: "#fca5a5",
            fontSize: "0.95rem",
          }}
        >
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={state.pending}
        style={{
          borderRadius: "0.75rem",
          border: 0,
          padding: "0.9rem 1rem",
          background: state.pending ? "#64748b" : "#2d8cff",
          color: "#f5f7fb",
          fontWeight: 600,
          cursor: state.pending ? "progress" : "pointer",
        }}
      >
        {state.pending ? "Signing in…" : "Continue"}
      </button>
    </form>
  );
}
