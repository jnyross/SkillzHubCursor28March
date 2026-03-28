import { rm } from "node:fs/promises";

import { createArtifactManifest } from "./manifest";
import { uploadArtifacts } from "./storage";
import type { RunnerExecutionOutput } from "../runner/types";

export async function finalizeRunArtifacts(
  projectId: string,
  iterationId: string,
  runId: string,
  result: RunnerExecutionOutput,
) {
  const manifest = createArtifactManifest(result.outputFiles);
  const prefix = `projects/${projectId}/iterations/${iterationId}/runs/${runId}`;
  const uploaded = await uploadArtifacts(prefix, result.outputFiles);

  return {
    manifest,
    uploaded,
  };
}

export async function cleanupRunWorkspace(workspacePath: string) {
  await rm(workspacePath, { recursive: true, force: true });
}
