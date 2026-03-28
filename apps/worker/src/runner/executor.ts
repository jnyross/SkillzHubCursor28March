import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import type { WorkerRuntimeEnv } from "../config";
import { enumerateArtifacts } from "../artifacts/enumerate";
import { runClaudeCodeCommand } from "./claude-code";
import { parseClaudeResult } from "./result-parser";
import { cleanupRunWorkdir, createRunWorkdir } from "./workdir";
import type {
  RunnerExecutionInput,
  RunnerOutputFile,
  RunnerExecutionOutput,
} from "./types";

async function writeInputFiles(
  baseDir: string,
  files: RunnerExecutionInput["inputFiles"] = [],
) {
  for (const file of files) {
    const targetPath = join(baseDir, file.path);
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, file.content, "utf8");
  }
}

async function writeSkillFiles(
  baseDir: string,
  skillName: string | undefined,
  files: RunnerExecutionInput["skillFiles"] = [],
) {
  if (!skillName || !files.length) {
    return;
  }

  const skillRoot = join(baseDir, ".claude", "skills", skillName);

  for (const file of files) {
    const targetPath = join(skillRoot, file.path);
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, file.content, "utf8");
  }
}

function buildClaudeCommandArgs(
  env: WorkerRuntimeEnv,
  input: RunnerExecutionInput,
  cwd: string,
) {
  const model = input.model ?? env.claudeModel;

  return {
    binaryPath: env.claudeBinary,
    cwd,
    timeoutMs: input.timeoutMs ?? env.claudeTimeoutMs,
    args: [
      "--bare",
      "--print",
      "--output-format",
      "json",
      "--no-session-persistence",
      "--permission-mode",
      "auto",
      "--model",
      model,
      "--max-turns",
      String(input.maxTurns ?? env.claudeMaxTurns),
      "--max-budget-usd",
      String(input.maxBudgetUsd ?? env.claudeMaxBudgetUsd),
      "--allowedTools",
      ...env.claudeAllowedTools,
      "-p",
      input.prompt,
    ],
  };
}

function convertArtifacts(
  artifacts: Awaited<ReturnType<typeof enumerateArtifacts>>,
): RunnerOutputFile[] {
  return artifacts.map((artifact) => ({
    path: artifact.relativePath,
    absolutePath: artifact.absolutePath,
    sha256: artifact.sha256,
    sizeBytes: artifact.sizeBytes,
  }));
}

export async function executeRunner(
  env: WorkerRuntimeEnv,
  keepWorkdirs: boolean,
  tmpRoot: string,
  input: RunnerExecutionInput,
): Promise<RunnerExecutionOutput> {
  const workdir = await createRunWorkdir(tmpRoot);
  const transcriptPath = join(workdir.path, "claude-output.json");
  const resolvedModel = input.model ?? env.claudeModel;

  try {
    await writeInputFiles(workdir.path, input.inputFiles);
    await writeSkillFiles(workdir.path, input.skillName, input.skillFiles);

    const command = buildClaudeCommandArgs(env, input, workdir.path);
    const commandResult = await runClaudeCodeCommand(command);
    await writeFile(transcriptPath, commandResult.stdout, "utf8");
    const parsed = parseClaudeResult(commandResult.stdout);

    if (commandResult.exitCode !== 0 || parsed.isError) {
      return {
        status: "failed",
        provider: "claude-code",
        modelId: parsed.modelId,
        totalTokens: null,
        durationMs: parsed.durationMs ?? commandResult.durationMs,
        totalCostUsd: parsed.totalCostUsd,
        transcriptUri: `file://${transcriptPath}`,
        outputFiles: [],
        rawStdout: commandResult.stdout,
        rawStderr: commandResult.stderr,
        failureReason: parsed.failureReason ?? `claude_exit_${commandResult.exitCode ?? "unknown"}`,
        workspacePath: keepWorkdirs ? workdir.path : null,
      };
    }

    const artifacts = await enumerateArtifacts(workdir.path);
    const outputFiles = convertArtifacts(artifacts);

    return {
      status: "succeeded",
      provider: "claude-code",
      modelId: parsed.modelId ?? resolvedModel,
      totalTokens: null,
      durationMs: parsed.durationMs ?? commandResult.durationMs,
      totalCostUsd: parsed.totalCostUsd,
      transcriptUri: `file://${transcriptPath}`,
      outputFiles,
      rawStdout: commandResult.stdout,
      rawStderr: commandResult.stderr,
      failureReason: null,
      workspacePath: workdir.path,
    };
  } finally {
    if (!keepWorkdirs) {
      await cleanupRunWorkdir(workdir.path);
    }
  }
}
