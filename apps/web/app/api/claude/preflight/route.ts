import { NextResponse } from "next/server";
import { spawnSync } from "node:child_process";

const CLAUDE_BIN = process.env.CLAUDE_CODE_BIN || "claude";

export async function GET() {
  const result = spawnSync(CLAUDE_BIN, ["--version"], {
    encoding: "utf8",
    timeout: 15_000,
    env: {
      PATH: process.env.PATH,
      HOME: process.env.HOME,
    },
  });

  const installed = result.status === 0;

  return NextResponse.json(
    {
      ok: installed,
      command: `${CLAUDE_BIN} --version`,
      installed,
      stdout: result.stdout?.trim() ?? "",
      stderr: result.stderr?.trim() ?? "",
      exitCode: result.status,
      signal: result.signal,
      hint: installed
        ? "Claude Code CLI is available on PATH."
        : "Install and authenticate Claude Code CLI before running live iteration tests.",
    },
    { status: installed ? 200 : 503 },
  );
}
