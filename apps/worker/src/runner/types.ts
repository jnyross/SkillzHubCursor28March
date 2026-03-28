export type RunnerInputFile = {
  path: string;
  content: string;
};

export type RunWorkdir = {
  root: string;
  path: string;
};

export type ClaudeCommandInput = {
  binaryPath: string;
  args: string[];
  cwd: string;
  timeoutMs: number;
};

export type ClaudeCommandResult = {
  command: string;
  args: string[];
  cwd: string;
  durationMs: number;
  exitCode: number | null;
  stdout: string;
  stderr: string;
};

export type RunnerExecutionInput = {
  prompt: string;
  projectId: string;
  iterationId: string;
  runId: string;
  model?: string;
  skillName?: string;
  skillMarkdown?: string;
  inputFiles?: RunnerInputFile[];
  keepWorkspace?: boolean;
};

export type RunnerOutputFile = {
  path: string;
  absolutePath: string;
  sha256: string;
  sizeBytes: number;
};

export type RunnerExecutionResult = {
  outputText: string;
  sessionId: string | null;
  costUsd: number | null;
  durationMs: number | null;
  turns: number | null;
  model: string | null;
  rawStdout: string;
  outputFiles: RunnerOutputFile[];
  workdir: string;
};
