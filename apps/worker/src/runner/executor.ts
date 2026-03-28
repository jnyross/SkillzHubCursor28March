import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import type { WorkerConfig } from "../config";
import { enumerateArtifacts } from "../artifacts/enumerate";
import { sha256File } from "../artifacts/checksum";
import { runClaudeCommand } from "./claude-code";
import { parseClaudeJsonResult } from "./result-parser";
import { cleanupRunWorkdir, createRunWorkdir } from "./workdir";
import type { RunnerExecutionInput, RunnerExecutionResult } from "./types";

async function writeInputFiles(baseDir: string, files: RunnerExecutionInput["inputFiles"] = []) {
  for (const file of files) {
    const targetPath = join(baseDir, file.path);
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, file.content, "utf8");
  }
}

async function writeSkillFile(
  baseDir: string,
  skillName: string | undefined,
  skillMarkdown: string | undefined,
) {
  if (!skillName || !skillMarkdown) {
    return;
  }

  const skillPath = join(baseDir, ".claude", "skills", skillName, "SKILL.md");
  await mkdir(dirname(skillPath), { recursive: true });
  await writeFile(skillPath, skillMarkdown, "utf8");
}

export async function executeClaudeRun(
  config: WorkerConfig,
  input: RunnerExecutionInput,
): Promise<RunnerExecutionResult> {
  const workdir = await createRunWorkdir();

  try {
    await writeInputFiles(workdir, input.inputFiles);
    await writeSkillFile(workdir, input.skillName, input.skillMarkdown);

    const commandResult = await runClaudeCommand({
      binaryPath: config.claudeBinary,
      model: input.model ?? config.claudeModel,
      prompt: input.prompt,
      cwd: workdir,
      timeoutMs: input.timeoutMs ?? config.claudeTimeoutMs,
      allowedTools: config.allowedTools,
    });

    const parsed = parseClaudeJsonResult(commandResult.stdout);
    const artifacts = await enumerateArtifacts(workdir);
    const outputFiles = await Promise.all(
      artifacts.map(async (artifact) => ({
        path: artifact.relativePath,
        absolutePath: artifact.absolutePath,
        sizeBytes: artifact.size,
        sha256: await sha256File(artifact.absolutePath),
      })),
    );

    return {
      outputText: parsed.result,
      sessionId: parsed.session_id ?? null,
      costUsd: parsed.cost_usd ?? null,
      durationMs: parsed.duration_ms ?? commandResult.durationMs,
      turns: parsed.num_turns ?? null,
      model: parsed.model ?? input.model ?? config.claudeModel,
      rawStdout: commandResult.stdout,
      outputFiles,
      workdir,
    };
  } finally {
    if (!input.keepWorkspace) {
      await cleanupRunWorkdir(workdir);
    }
  }
}
