import { readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";

import { sha256File } from "./checksum";

export type EnumeratedArtifact = {
  absolutePath: string;
  relativePath: string;
  sizeBytes: number;
  sha256: string;
};

async function walkDirectory(root: string, current: string): Promise<EnumeratedArtifact[]> {
  const entries = await readdir(current, { withFileTypes: true });
  const files: EnumeratedArtifact[] = [];

  for (const entry of entries) {
    const absolutePath = join(current, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walkDirectory(root, absolutePath)));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const fileStat = await stat(absolutePath);
    const sha256 = await sha256File(absolutePath);
    files.push({
      absolutePath,
      relativePath: relative(root, absolutePath),
      sizeBytes: fileStat.size,
      sha256,
    });
  }

  return files.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}

export async function enumerateArtifacts(root: string) {
  return walkDirectory(root, root);
}
