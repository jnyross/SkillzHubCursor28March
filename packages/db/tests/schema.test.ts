import { describe, expect, it } from "vitest";

import {
  auditEvents,
  assertions,
  benchmarks,
  comparablePairs,
  evalCases,
  evalSets,
  grades,
  iterationEvalSnapshots,
  iterations,
  runs,
  skillFiles,
  skillVersions,
  skills,
  projects,
} from "../src/schema";

describe("phase 1 schema", () => {
  it("exports the primary tables", () => {
    expect(projects[Symbol.for("drizzle:Name")]).toBe("projects");
    expect(skills[Symbol.for("drizzle:Name")]).toBe("skills");
    expect(skillVersions[Symbol.for("drizzle:Name")]).toBe("skill_versions");
    expect(skillFiles[Symbol.for("drizzle:Name")]).toBe("skill_files");
    expect(evalSets[Symbol.for("drizzle:Name")]).toBe("eval_sets");
    expect(evalCases[Symbol.for("drizzle:Name")]).toBe("eval_cases");
    expect(assertions[Symbol.for("drizzle:Name")]).toBe("assertions");
    expect(iterations[Symbol.for("drizzle:Name")]).toBe("iterations");
    expect(iterationEvalSnapshots[Symbol.for("drizzle:Name")]).toBe("iteration_eval_snapshots");
    expect(runs[Symbol.for("drizzle:Name")]).toBe("runs");
    expect(grades[Symbol.for("drizzle:Name")]).toBe("grades");
    expect(comparablePairs[Symbol.for("drizzle:Name")]).toBe("comparable_pairs");
    expect(benchmarks[Symbol.for("drizzle:Name")]).toBe("benchmarks");
    expect(auditEvents[Symbol.for("drizzle:Name")]).toBe("audit_events");
  });
});
