import { constants } from "node:fs";
import { access } from "node:fs/promises";
import { spawn } from "node:child_process";

export type ClaudePreflightStatus = "ok" | "missing_binary" | "not_authenticated" | "error";

export interface ClaudePreflightResult {
  status: ClaudePreflightStatus;
  binaryPath: string;
  versionCommand: string;
  authCommand: string;
  authenticated: boolean;
  version: string | null;
  authMethod: string | null;
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

interface CommandResult {
  code: number | null;
  stdout: string;
  stderr: string;
}

async function runCommand(binaryPath: string, args: string[]): Promise<CommandResult> {
  return new Promise<CommandResult>((resolve) => {
    const child = spawn(binaryPath, args, {
      env: {
        ...process.env,
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
        code: 127,
        stdout: trimOutput(stdout),
        stderr: trimOutput(`${stderr}\n${error.message}`),
      });
    });

    child.on("close", (code) => {
      resolve({
        code,
        stdout: trimOutput(stdout),
        stderr: trimOutput(stderr),
      });
    });
  });
}

export async function runClaudePreflight(
  config: ClaudeRuntimeConfig = {},
): Promise<ClaudePreflightResult> {
  const binaryPath = config.binaryPath || process.env.CLAUDE_CODE_BIN || DEFAULT_CLAUDE_BINARY;
  const versionCommand = `${binaryPath} --version`;
  const authCommand = `${binaryPath} auth status`;

  try {
    await commandExists(binaryPath);
  } catch {
    return {
      status: "missing_binary",
      binaryPath,
      versionCommand,
      authCommand,
      authenticated: false,
      version: null,
      authMethod: null,
      stdout: "",
      stderr: "Claude CLI binary is not executable or not found at the configured path.",
    };
  }

  const versionResult = await runCommand(binaryPath, ["--version"]);
  const version = versionResult.stdout || null;

  if (versionResult.code !== 0) {
    return {
      status: "error",
      binaryPath,
      versionCommand,
      authCommand,
      authenticated: false,
      version,
      authMethod: null,
      stdout: versionResult.stdout,
      stderr: versionResult.stderr,
    };
  }

  const authResult = await runCommand(binaryPath, ["auth", "status"]);
  const authPayload = `${authResult.stdout}\n${authResult.stderr}`;
  const normalizedAuth = authPayload.toLowerCase();

  let loggedIn = false;
  let authMethod: string | null = null;

  try {
    const parsed = JSON.parse(authResult.stdout);
    loggedIn = Boolean(parsed.loggedIn);
    authMethod = typeof parsed.authMethod === "string" ? parsed.authMethod : null;
  } catch {
    loggedIn = authResult.code === 0 && !normalizedAuth.includes('"loggedin": false');
  }

  if (!loggedIn) {
    return {
      status: "not_authenticated",
      binaryPath,
      versionCommand,
      authCommand,
      authenticated: false,
      version,
      authMethod,
      stdout: authResult.stdout,
      stderr: authResult.stderr,
    };
  }

  return {
    status: "ok",
    binaryPath,
    versionCommand,
    authCommand,
    authenticated: true,
    version,
    authMethod,
    stdout: authResult.stdout,
    stderr: authResult.stderr,
  };
}
