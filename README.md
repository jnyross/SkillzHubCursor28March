# Skill Builder Webapp

Phase 0 bootstraps a local-first monorepo for a Claude Code-powered skill authoring and evaluation product.

## Workspace layout

```text
apps/
  web/       # Next.js App Router frontend + API routes
  worker/    # TypeScript worker scaffold

packages/
  shared/    # Shared runtime helpers and contracts
  db/        # Database package scaffold
  ui/        # UI package scaffold
```

## Requirements

- Node.js 22+
- pnpm 10+
- Docker CLI + Docker Compose
- PostgreSQL client tools (`psql`)
- Claude Code CLI (`claude`)

## Quick start

1. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

2. Install workspace dependencies:

   ```bash
   pnpm install
   ```

3. Start local infrastructure:

   ```bash
   pnpm infra:up:host
   ```

4. Start the web app:

   ```bash
   pnpm dev:web
   ```

5. Start the worker:

   ```bash
   pnpm dev:worker
   ```

## Claude Code CLI setup

The product uses the real Claude Code CLI as its execution backend. Before Phase 1 work, complete this setup from the same shell environment you will use to run the worker.

1. Confirm the CLI is installed:

   ```bash
   claude --version
   ```

2. Sign in:

   ```bash
   claude auth login
   ```

3. Verify authentication:

   ```bash
   claude auth status
   ```

4. Verify the repo-level smoke script:

   ```bash
   pnpm claude:smoke
   ```

5. Check the API preflight endpoint once the web app is running:

   ```bash
   curl http://127.0.0.1:3000/api/claude/preflight
   ```

Expected result:

- `claude --version` succeeds
- `claude auth status` reports `loggedIn: true`
- `/api/claude/preflight` returns `ok: true`

## Local infrastructure

`docker-compose.yml` provisions:

- Postgres 16 on `127.0.0.1:5432`
- MinIO on `127.0.0.1:9000`
- MinIO console on `127.0.0.1:9001`
- automatic creation of the `skill-builder-artifacts` bucket

### Host fallback for restricted VMs

If Docker is unavailable in your environment, the repo also supports a host-mode fallback:

```bash
pnpm infra:up:host
```

That script will:

- start the local PostgreSQL 16 cluster
- create/update the `skill_builder` database user and database
- start MinIO on `127.0.0.1:9000`
- create the `skill-builder-artifacts` bucket

The MinIO process is launched in the background and writes logs to:

```text
/workspace/.data/minio/minio.log
```

To stop the host-mode services later:

```bash
pnpm infra:down:host
```

## Phase 0 health endpoints

- Web health: `GET /api/health`
- Claude CLI preflight: `GET /api/claude/preflight`

## Live E2E testing policy

This project is intended to be validated with real end-to-end flows:

- real HTTP requests
- real Postgres
- real S3-compatible storage
- real worker process
- real Claude Code CLI

Unit tests are still useful for deterministic helpers, but they are not the acceptance gate for the product.

## Current environment status on this machine

At bootstrap time, the following were verified:

- Node.js, pnpm, Docker CLI, Docker Compose, `psql`, and Claude Code CLI are installed
- Claude Code CLI is **not yet authenticated** (`claude auth status` returned `loggedIn: false`)
- Docker daemon startup inside this VM failed because kernel/container networking support is restricted (`iptables nat` setup failed)
- Host-mode fallback is now available:
  - PostgreSQL 16 server is installed and can run locally
  - MinIO server/client binaries are installed and can run locally

### What you need to do next

1. Sign in to Claude Code:

   ```bash
   claude auth login
   ```

2. Start host-mode infra if Docker is still unavailable:

   ```bash
   pnpm infra:up:host
   ```

3. If you want to use Docker instead, you will still need a VM/container runtime that supports Docker networking.

Phase 1 can proceed once:

- `claude auth login` has completed successfully
- `pnpm claude:preflight` returns authenticated status
- either `pnpm infra:up` or `pnpm infra:up:host` is working end-to-end
