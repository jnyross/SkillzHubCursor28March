import { rm } from "node:fs/promises";

import { buildArtifactManifest } from "./manifest";
import { uploadArtifactFiles } from "./storage";
import type { RunnerExecutionOutput } from "../runner/types";

export async function finalizeRunArtifacts(
  projectId: string,
  iterationId: string,
  runId: string,
  result: RunnerExecutionOutput,
) {
  const manifest = buildArtifactManifest(result.outputFiles);
  const prefix = `projects/${projectId}/iterations/${iterationId}/runs/${runId}`;
  const uploaded = await uploadArtifactFiles(prefix, result.outputFiles);

  return {
    manifest,
    uploaded,
  };
}

export async function cleanupRunWorkspace(workspacePath: string) {
  await rm(workspacePath, { recursive: true, force: true });
}
