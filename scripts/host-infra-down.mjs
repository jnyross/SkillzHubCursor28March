import { readFile, rm } from "node:fs/promises";
import { join } from "node:path";

const projectRoot = new URL("..", import.meta.url);
const minioPidFile = join(projectRoot.pathname, ".data", "minio", "minio.pid");

async function main() {
  try {
    const pid = Number((await readFile(minioPidFile, "utf8")).trim());
    process.kill(pid, "SIGTERM");
    await rm(minioPidFile, { force: true });
    console.log(
      JSON.stringify(
        {
          minio: "stopped",
          pid,
        },
        null,
        2,
      ),
    );
  } catch {
    console.log(
      JSON.stringify(
        {
          minio: "not_running",
        },
        null,
        2,
      ),
    );
  }
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      null,
      2,
    ),
  );
  process.exit(1);
});
