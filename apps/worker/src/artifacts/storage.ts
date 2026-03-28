import { readFile } from "node:fs/promises";

import { PutObjectCommand, S3Client, type S3ClientConfig } from "@aws-sdk/client-s3";

import type { EnumeratedArtifact } from "./enumerate";
import type { WorkerRuntimeConfig } from "../config";

function createS3Client(config: WorkerRuntimeConfig) {
  const s3Config: S3ClientConfig = {
    region: config.s3.region,
    endpoint: config.s3.endpoint,
    credentials: {
      accessKeyId: config.s3.accessKeyId,
      secretAccessKey: config.s3.secretAccessKey,
    },
    forcePathStyle: true,
  };

  return new S3Client(s3Config);
}

export async function uploadArtifact(
  config: WorkerRuntimeConfig,
  key: string,
  body: Buffer | string,
  contentType = "application/octet-stream",
) {
  const s3Client = createS3Client(config);

  await s3Client.send(
    new PutObjectCommand({
      Bucket: config.s3.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  return `s3://${config.s3.bucket}/${key}`;
}

export async function uploadArtifactFiles(
  config: WorkerRuntimeConfig,
  prefix: string,
  files: EnumeratedArtifact[],
) {
  const uploaded: Array<EnumeratedArtifact & { storageUri: string }> = [];

  for (const file of files) {
    const body = await readFile(file.absolutePath);
    const storageUri = await uploadArtifact(
      config,
      `${prefix}/${file.relativePath}`,
      body,
    );
    uploaded.push({
      ...file,
      storageUri,
    });
  }

  return uploaded;
}
