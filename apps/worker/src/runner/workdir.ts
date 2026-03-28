import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type { RunWorkdir } from "./types";

const workdirPrefix = "skill-builder-run-";

export async function createRunWorkdir(tmpRoot?: string): Promise<RunWorkdir> {
  const root = tmpRoot ?? tmpdir();
  await mkdir(root, { recursive: true });
  const path = await mkdtemp(join(root, workdirPrefix));
  return { root, path };
}

export async function cleanupRunWorkdir(path: string) {
  await rm(path, {
    recursive: true,
    force: true,
  });
}
