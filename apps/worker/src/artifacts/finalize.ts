import { rm } from "node:fs/promises";

import type { WorkerConfig } from "../config";
import type { RunnerExecutionOutput } from "../runner/types";
import { createArtifactManifest } from "./manifest";
import { uploadArtifactFiles } from "./storage";

export async function finalizeRunArtifacts(
  config: WorkerConfig,
  projectId: string,
  iterationId: string,
  runId: string,
  result: RunnerExecutionOutput,
) {
  const manifest = createArtifactManifest(result.outputFiles);
  const prefix = `projects/${projectId}/iterations/${iterationId}/runs/${runId}`;
  const uploaded = await uploadArtifactFiles(
    config,
    prefix,
    result.outputFiles.map((file) => ({
      absolutePath: file.path,
      relativePath: file.path,
      sha256: file.sha256,
      sizeBytes: file.sizeBytes,
    })),
  );

  return {
    manifest,
    uploaded,
  };
}

export async function cleanupRunWorkspace(workspacePath: string) {
  await rm(workspacePath, { recursive: true, force: true });
}
