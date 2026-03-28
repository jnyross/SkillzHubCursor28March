import { redirect } from "next/navigation";

import { getSessionFromCookies } from "../../lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getSessionFromCookies();

  if (session) {
    redirect("/");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
      }}
    >
      <div
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
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Local sign in</h1>
        <p style={{ margin: 0, color: "#a3b1c2", lineHeight: 1.6 }}>
          Sign in with the single-user password configured in the local environment.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
