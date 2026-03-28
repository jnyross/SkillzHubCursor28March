import { NextResponse } from "next/server";
import { runClaudePreflight } from "../../../../lib/claude-preflight";

export async function GET() {
  const result = await runClaudePreflight();
  const ok = result.status === "ok";

  return NextResponse.json(
    {
      ok,
      ...result,
      hint: ok
        ? "Claude Code CLI is installed and authenticated."
        : "Install and authenticate Claude Code CLI before running live iteration tests.",
    },
    { status: ok ? 200 : 503 },
  );
}
