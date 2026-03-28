import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { spawn } from "node:child_process";

export type ClaudePreflightStatus = "ok" | "missing_binary" | "not_authenticated" | "error";

export interface ClaudePreflightResult {
  status: ClaudePreflightStatus;
  binaryPath: string;
  command: string;
  authenticated: boolean;
  version: string | null;
  stdout: string;
  stderr: string;
}

export interface ClaudeRuntimeConfig {
  binaryPath?: string;
}

const DEFAULT_CLAUDE_BINARY = "claude";

function trimOutput(value: string) {
  return value.trim().slice(0, 4000);
}

async function commandExists(binaryPath: string) {
  if (binaryPath.includes("/")) {
    await access(binaryPath, constants.X_OK);
  }
}

export async function runClaudePreflight(
  config: ClaudeRuntimeConfig = {},
): Promise<ClaudePreflightResult> {
  const binaryPath = config.binaryPath || process.env.CLAUDE_CODE_BIN || DEFAULT_CLAUDE_BINARY;
  const command = `${binaryPath} --version`;

  try {
    await commandExists(binaryPath);
  } catch {
    return {
      status: "missing_binary",
      binaryPath,
      command,
      authenticated: false,
      version: null,
      stdout: "",
      stderr: "Claude CLI binary is not executable or not found at the configured path.",
    };
  }

  return new Promise<ClaudePreflightResult>((resolve) => {
    const child = spawn(binaryPath, ["--version"], {
      env: {
        PATH: process.env.PATH ?? "",
        HOME: process.env.HOME ?? "",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });

    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });

    child.on("error", (error) => {
      resolve({
        status: "missing_binary",
        binaryPath,
        command,
        authenticated: false,
        version: null,
        stdout: trimOutput(stdout),
        stderr: trimOutput(`${stderr}\n${error.message}`),
      });
    });

    child.on("close", (code) => {
      const normalizedStdout = trimOutput(stdout);
      const normalizedStderr = trimOutput(stderr);
      const combined = `${normalizedStdout}\n${normalizedStderr}`.toLowerCase();
      const version = normalizedStdout || null;

      if (code === 0) {
        resolve({
          status: "ok",
          binaryPath,
          command,
          authenticated: true,
          version,
          stdout: normalizedStdout,
          stderr: normalizedStderr,
        });
        return;
      }

      if (
        combined.includes("login") ||
        combined.includes("sign in") ||
        combined.includes("authenticate") ||
        combined.includes("auth")
      ) {
        resolve({
          status: "not_authenticated",
          binaryPath,
          command,
          authenticated: false,
          version,
          stdout: normalizedStdout,
          stderr: normalizedStderr,
        });
        return;
      }

      resolve({
        status: "error",
        binaryPath,
        command,
        authenticated: false,
        version,
        stdout: normalizedStdout,
        stderr: normalizedStderr,
      });
    });
  });
}
