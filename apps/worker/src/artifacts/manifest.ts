import { createHash } from "node:crypto";

import type { EnumeratedArtifact } from "./enumerate";

export interface ArtifactManifestEntry {
  path: string;
  sha256: string;
  sizeBytes: number;
}

export interface ArtifactManifest {
  generatedAt: string;
  fileCount: number;
  files: ArtifactManifestEntry[];
  manifestHash: string;
}

export function buildArtifactManifest(
  files: EnumeratedArtifact[],
): ArtifactManifest {
  const manifestFiles = files.map((file) => ({
    path: file.relativePath,
    sha256: file.sha256,
    sizeBytes: file.sizeBytes,
  }));

  const manifestHash = createHash("sha256")
    .update(JSON.stringify(manifestFiles))
    .digest("hex");

  return {
    generatedAt: new Date().toISOString(),
    fileCount: manifestFiles.length,
    files: manifestFiles,
    manifestHash,
  };
}
