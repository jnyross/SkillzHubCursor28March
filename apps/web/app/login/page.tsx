"use client";

import { useState } from "react";

export default function LoginPage() {
  const [password, setPassword] = useState("");

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
      }}
    >
      <form
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
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Local login placeholder</h1>
        <p style={{ margin: 0, color: "#a3b1c2", lineHeight: 1.6 }}>
          Phase 0 includes the route scaffold only. Real single-user session auth will be
          implemented in Phase 2.
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
        <button
          type="button"
          style={{
            borderRadius: "0.75rem",
            border: 0,
            padding: "0.9rem 1rem",
            background: "#2d8cff",
            color: "#f5f7fb",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Continue
        </button>
      </form>
    </main>
  );
}
