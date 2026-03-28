import { readFile } from "node:fs/promises";

import { PutObjectCommand, S3Client, type S3ClientConfig } from "@aws-sdk/client-s3";

import type { ArtifactFile } from "./enumerate";
import { getWorkerConfig } from "../config";

function createS3Client() {
  const config = getWorkerConfig();
  const s3Config: S3ClientConfig = {
    region: config.s3Region,
    endpoint: config.s3Endpoint,
    credentials: {
      accessKeyId: config.s3AccessKeyId,
      secretAccessKey: config.s3SecretAccessKey,
    },
    forcePathStyle: true,
  };

  return new S3Client(s3Config);
}

export async function uploadArtifact(
  key: string,
  body: Buffer | string,
  contentType = "application/octet-stream",
) {
  const config = getWorkerConfig();
  const s3Client = createS3Client();

  await s3Client.send(
    new PutObjectCommand({
      Bucket: config.s3Bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  return `s3://${config.s3Bucket}/${key}`;
}

export async function uploadArtifactFiles(prefix: string, files: ArtifactFile[]) {
  const uploaded: Array<ArtifactFile & { storageUri: string }> = [];

  for (const file of files) {
    const body = await readFile(file.absolutePath);
    const storageUri = await uploadArtifact(`${prefix}/${file.relativePath}`, body);
    uploaded.push({
      ...file,
      storageUri,
    });
  }

  return uploaded;
}
