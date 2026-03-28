import type { ReactNode } from "react";

import { redirect } from "next/navigation";

import { getCurrentSession } from "../../lib/session";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login?redirect=%2Fprojects");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateRows: "auto 1fr",
      }}
    >
      <header
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(6, 18, 29, 0.92)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "1rem 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div style={{ display: "grid", gap: "0.25rem" }}>
            <strong>Skill Builder Webapp</strong>
            <span style={{ color: "#a3b1c2", fontSize: "0.9rem" }}>
              Signed in as {session.user}
            </span>
          </div>
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              style={{
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "transparent",
                color: "inherit",
                padding: "0.65rem 1rem",
                cursor: "pointer",
              }}
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
