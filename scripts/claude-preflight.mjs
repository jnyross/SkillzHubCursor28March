import { runClaudePreflight } from "../packages/shared/src/claude.ts";

const result = await runClaudePreflight();

console.log(JSON.stringify(result, null, 2));

process.exit(result.status === "ok" ? 0 : 1);
