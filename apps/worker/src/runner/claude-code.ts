import { spawn } from "node:child_process";

import type { ClaudeCommandInput, ClaudeCommandResult } from "./types";

export async function runClaudeCodeCommand(
  input: ClaudeCommandInput,
): Promise<ClaudeCommandResult> {
  const startedAt = Date.now();

  return new Promise<ClaudeCommandResult>((resolve) => {
    const child = spawn(input.binaryPath, input.args, {
      cwd: input.cwd,
      env: {
        PATH: process.env.PATH ?? "",
        HOME: process.env.HOME ?? "",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      setTimeout(() => {
        child.kill("SIGKILL");
      }, 30_000).unref();
    }, input.timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });

    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });

    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({
        command: input.binaryPath,
        args: input.args,
        cwd: input.cwd,
        durationMs: Date.now() - startedAt,
        exitCode: 127,
        stdout,
        stderr: `${stderr}\n${error.message}`,
      });
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({
        command: input.binaryPath,
        args: input.args,
        cwd: input.cwd,
        durationMs: Date.now() - startedAt,
        exitCode: code,
        stdout,
        stderr,
      });
    });
  });
}
