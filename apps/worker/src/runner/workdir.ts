import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import type { WorkerConfig } from "../config";
import type { RunWorkdir } from "./types";

const workdirPrefix = "skill-builder-run-";

export async function createRunWorkdir(config: WorkerConfig): Promise<RunWorkdir> {
  const root = config.tmpRoot ?? tmpdir();
  await mkdir(root, { recursive: true });
  const path = await mkdtemp(join(root, workdirPrefix));
  return {
    root,
    path,
  };
}

export async function cleanupRunWorkdir(path: string) {
  await rm(path, {
    recursive: true,
    force: true,
  });
}
