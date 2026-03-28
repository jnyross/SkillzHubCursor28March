import { readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";

export type ArtifactFile = {
  absolutePath: string;
  relativePath: string;
  size: number;
};

async function walkDirectory(root: string, current: string): Promise<ArtifactFile[]> {
  const entries = await readdir(current, { withFileTypes: true });
  const files: ArtifactFile[] = [];

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
    files.push({
      absolutePath,
      relativePath: relative(root, absolutePath),
      size: fileStat.size,
    });
  }

  return files.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}

export async function enumerateArtifacts(root: string) {
  return walkDirectory(root, root);
}
