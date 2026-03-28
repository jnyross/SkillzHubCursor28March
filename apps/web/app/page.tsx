import styles from "./page.module.css";

const commands = [
  "cp .env.example .env",
  "pnpm install",
  "pnpm infra:up:host",
  "pnpm claude:preflight",
  "pnpm dev:web",
  "pnpm dev:worker",
];

const checklist = [
  "Install Claude Code CLI on the host machine.",
  "Run `claude auth login` from the same shell profile used for the worker.",
  "Verify `pnpm claude:smoke` succeeds before Phase 1 execution work.",
  "Run `pnpm infra:up:host` to boot host PostgreSQL + MinIO before real end-to-end testing.",
];

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <span className={styles.eyebrow}>Phase 0 bootstrap</span>
          <h1 className={styles.title}>Skill Builder Webapp</h1>
          <p className={styles.description}>
            Local-first monorepo bootstrap for a Claude Code-powered skill
            authoring, evaluation, and blind review workflow.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Workspace status</h2>
          <ul>
            <li>Next.js App Router web shell is bootstrapped.</li>
            <li>Worker package is ready for pg-boss and Claude CLI orchestration.</li>
            <li>Shared, db, and ui workspace packages are scaffolded.</li>
            <li>Both Docker Compose and host-mode Postgres/MinIO startup paths are documented.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Recommended startup commands</h2>
          <div className={styles.commands}>
            {commands.map((command) => (
              <code key={command}>{command}</code>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2>Claude CLI readiness checklist</h2>
          <ol>
            {checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  );
}
