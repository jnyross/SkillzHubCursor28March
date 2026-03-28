import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";

export async function sha256File(path: string) {
  return new Promise<string>((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(path);

    stream.on("data", (chunk) => {
      hash.update(chunk);
    });
    stream.on("error", reject);
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

export async function sha256Buffer(
  value: Buffer | string,
): Promise<string> {
  const hash = createHash("sha256");
  hash.update(value);
  return hash.digest("hex");
}
