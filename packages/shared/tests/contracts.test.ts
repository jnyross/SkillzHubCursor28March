import { describe, expect, it } from "vitest";

import {
  BenchmarkSchema,
  ComparablePairStatusEnum,
  createTransitionValidator,
  EvalSetStatusEnum,
  GradeSchema,
  IterationSchema,
  IterationStatusEnum,
  ProjectSchema,
  ReviewSubmissionSchema,
  RunSchema,
  RunStatusEnum,
  SkillVersionStatusEnum,
} from "../src/index";

describe("shared contracts", () => {
  it("parses representative phase 1 payloads", () => {
    expect(ProjectSchema.parse({
      id: "proj_123",
      name: "Skill Builder",
      slug: "skill-builder",
      status: "draft",
      briefJson: { problem: "Automate skill iteration" },
      briefApprovedAt: null,
      ownerUserId: "local-admin",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).slug).toBe("skill-builder");

    expect(IterationSchema.parse({
      id: "iter_123",
      projectId: "proj_123",
      number: 1,
      skillVersionId: "skill_v1",
      baselineSkillVersionId: null,
      evalSetId: "eval_123",
      templateHash: "abc123",
      modelConfig: { model: "claude-sonnet-4-5" },
      toolConfig: { allowedTools: ["Read", "Edit"] },
      candidateAssignment: {
        primaryRunId: "run_primary",
        baselineRunId: "run_baseline",
        candidateA: "baseline",
        candidateB: "primary",
      },
      status: "queued",
      totalPairs: 1,
      gradedPairCount: 0,
      reviewedAt: null,
      reviewNotes: null,
      startedAt: null,
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).status).toBe("queued");

    expect(RunSchema.parse({
      id: "run_123",
      iterationId: "iter_123",
      evalSnapshotId: "snap_123",
      config: "with_skill",
      status: "queued",
      provider: "claude-code",
      modelId: "claude-sonnet-4-5",
      templateHash: "abc123",
      skillMode: "with_skill",
      skillBundleHash: null,
      totalTokens: null,
      durationMs: null,
      totalCostUsd: null,
      artifactStorageUri: null,
      manifestHash: null,
      transcriptUri: null,
      failureReason: null,
      startedAt: null,
      completedAt: null,
      createdAt: new Date().toISOString(),
    }).provider).toBe("claude-code");

    expect(GradeSchema.parse({
      runId: "run_123",
      graderVersion: "phase1",
      grading: {
        expectations: [
          {
            text: "creates output",
            passed: true,
            evidence: "Found outputs/report.md",
          },
        ],
      },
      completedAt: new Date().toISOString(),
    }).grading.expectations).toHaveLength(1);

    expect(BenchmarkSchema.parse({
      iterationId: "iter_123",
      benchmarkHash: "hash_123",
      comparablePairCount: 1,
      excludedPairCount: 0,
      configMetrics: {
        primary: {
          passRate: 1,
          meanPassCount: 1,
          meanDurationMs: 2500,
          meanTokens: 1234,
          meanCostUsd: 0.02,
        },
        baseline: {
          passRate: 0,
          meanPassCount: 0,
          meanDurationMs: 2200,
          meanTokens: 1000,
          meanCostUsd: 0.018,
        },
      },
      deltas: {
        passRate: 1,
        meanPassCount: 1,
        meanDurationMs: 300,
        meanTokens: 234,
        meanCostUsd: 0.002,
      },
      createdAt: new Date().toISOString(),
    }).configMetrics.primary.passRate).toBe(1);

    expect(ReviewSubmissionSchema.parse({
      iterationId: "iter_123",
      benchmarkHash: "hash_123",
      notes: "Candidate A was more complete.",
      revealRequested: false,
      completedAt: new Date().toISOString(),
    }).revealRequested).toBe(false);
  });

  it("exposes the constrained status enums", () => {
    expect(SkillVersionStatusEnum.options).toContain("accepted");
    expect(EvalSetStatusEnum.options).toContain("frozen");
    expect(IterationStatusEnum.options).toContain("reviewing");
    expect(RunStatusEnum.options).toContain("failed");
    expect(ComparablePairStatusEnum.options).toContain("graded");
  });

  it("validates legal transitions and rejects illegal ones", () => {
    const validateSkillTransition = createTransitionValidator("SkillVersion", {
      draft: ["frozen", "abandoned"],
      frozen: ["accepted", "abandoned"],
      accepted: ["superseded"],
      superseded: [],
      abandoned: [],
    } as const);

    expect(validateSkillTransition("draft", "frozen")).toEqual({
      from: "draft",
      to: "frozen",
    });

    expect(() => validateSkillTransition("draft", "accepted")).toThrow(
      "Invalid SkillVersion transition",
    );
  });
});
