import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const projectRoot = new URL("..", import.meta.url);
const dataDir = join(projectRoot.pathname, ".data");
const minioDir = join(dataDir, "minio");
const minioPidFile = join(minioDir, "minio.pid");
const minioLogFile = join(minioDir, "minio.log");

const postgresRole = process.env.HOST_POSTGRES_USER ?? "skill_builder";
const postgresPassword = process.env.HOST_POSTGRES_PASSWORD ?? "skill_builder";
const postgresDatabase = process.env.HOST_POSTGRES_DB ?? "skill_builder";

const minioRootUser = process.env.MINIO_ROOT_USER ?? "minio";
const minioRootPassword = process.env.MINIO_ROOT_PASSWORD ?? "minio123";
const minioBucket = process.env.S3_BUCKET ?? "skill-builder-artifacts";
const minioEndpoint = process.env.S3_ENDPOINT ?? "http://127.0.0.1:9000";

async function run(command, args, options = {}) {
  return execFileAsync(command, args, {
    cwd: projectRoot.pathname,
    env: process.env,
    ...options,
  });
}

async function ensurePostgres() {
  try {
    await run("sudo", ["-u", "postgres", "/usr/bin/pg_ctlcluster", "16", "main", "start"]);
  } catch {
    const status = await run("sudo", [
      "-u",
      "postgres",
      "/usr/bin/pg_ctlcluster",
      "16",
      "main",
      "status",
    ]);

    if (!status.stdout.includes("server is running")) {
      throw new Error("PostgreSQL cluster could not be started.");
    }
  }

  const createRoleSql = [
    "DO $$",
    "BEGIN",
    `  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${postgresRole}') THEN`,
    `    CREATE ROLE ${postgresRole} LOGIN PASSWORD '${postgresPassword}';`,
    "  END IF;",
    "END",
    "$$;",
  ].join("\n");

  await run("sudo", ["-u", "postgres", "psql", "-v", "ON_ERROR_STOP=1", "-d", "postgres", "-c", createRoleSql]);

  const existingDatabase = await run("sudo", [
    "-u",
    "postgres",
    "psql",
    "-Atqc",
    `SELECT 1 FROM pg_database WHERE datname = '${postgresDatabase}'`,
    "postgres",
  ]);

  if (!existingDatabase.stdout.trim()) {
    await run("sudo", [
      "-u",
      "postgres",
      "createdb",
      "-O",
      postgresRole,
      postgresDatabase,
    ]);
  }
}

async function readExistingMinioPid() {
  try {
    const pidText = await readFile(minioPidFile, "utf8");
    const pid = Number(pidText.trim());
    process.kill(pid, 0);
    return pid;
  } catch {
    await rm(minioPidFile, { force: true });
    return null;
  }
}

async function ensureMinioAlias() {
  try {
    await run("mc", ["alias", "set", "local", minioEndpoint, minioRootUser, minioRootPassword]);
    return;
  } catch {
    await rm("/home/ubuntu/.mc/config.json", { force: true });
    await run("mc", ["alias", "set", "local", minioEndpoint, minioRootUser, minioRootPassword]);
  }
}

async function waitForMinio() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`${minioEndpoint}/minio/health/live`);
      if (response.ok) {
        return;
      }
    } catch {
      // retry
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error("MinIO did not become healthy within 30 seconds.");
}

async function ensureMinio() {
  await mkdir(minioDir, { recursive: true });

  const existingPid = await readExistingMinioPid();
  if (!existingPid) {
    const child = spawn("minio", ["server", minioDir, "--console-address", ":9001"], {
      cwd: projectRoot.pathname,
      env: {
        ...process.env,
        MINIO_ROOT_USER: minioRootUser,
        MINIO_ROOT_PASSWORD: minioRootPassword,
      },
      detached: true,
      stdio: "ignore",
    });

    child.unref();
    await writeFile(minioPidFile, `${child.pid}\n`, "utf8");
    await writeFile(
      minioLogFile,
      `${new Date().toISOString()} launched minio pid=${child.pid}\n`,
      { flag: "a" },
    );
  }

  await waitForMinio();

  await ensureMinioAlias();
  await run("mc", ["mb", "--ignore-existing", `local/${minioBucket}`]);
}

async function main() {
  await mkdir(dirname(minioPidFile), { recursive: true });
  await writeFile(minioLogFile, `${new Date().toISOString()} host infra start requested\n`, {
    flag: "a",
  });

  await ensurePostgres();
  await ensureMinio();

  const result = {
    postgres: {
      status: "online",
      role: postgresRole,
      database: postgresDatabase,
      connectionString: `postgresql://${postgresRole}:${postgresPassword}@127.0.0.1:5432/${postgresDatabase}`,
    },
    minio: {
      status: "online",
      endpoint: minioEndpoint,
      console: "http://127.0.0.1:9001",
      bucket: minioBucket,
      accessKeyId: minioRootUser,
    },
  };

  console.log(JSON.stringify(result, null, 2));
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
