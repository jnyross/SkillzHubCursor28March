import { describe, expect, it } from "vitest";

import {
  benchmarkSchema,
  comparablePairStatuses,
  createTransitionValidator,
  evalSetStatuses,
  gradeSchema,
  InvalidTransitionError,
  iterationSchema,
  iterationStatuses,
  projectRecordSchema,
  reviewDecisionSchema,
  runRecordSchema,
  runStatuses,
  skillVersionStatuses,
} from "../src/index";

describe("shared contracts", () => {
  it("parses representative phase 1 payloads", () => {
    expect(projectRecordSchema.parse({
      id: "7f2f230c-96cf-44ef-9c11-85aa0aef7a1b",
      name: "Skill Builder",
      slug: "skill-builder",
      status: "draft",
      briefJson: {
        sourceRequest: "Create a skill builder",
        problemStatement: "Automate skill iteration",
        targetUser: "internal users",
        outputExpectations: ["paired eval results"],
      },
      briefApprovedAt: null,
      ownerUserId: "local-admin",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).slug).toBe("skill-builder");

    expect(iterationSchema.parse({
      id: "ecec15a7-c4e4-4fbe-9a3d-7ee43f3d8b8a",
      projectId: "7f2f230c-96cf-44ef-9c11-85aa0aef7a1b",
      number: 1,
      skillVersionId: "8d0cabdb-1c85-438c-af06-c9dd0019a6c9",
      baselineSkillVersionId: null,
      evalSetId: "a96a6f77-9d15-4b54-a6fd-59378b53b059",
      templateHash: "abc123",
      modelConfig: {
        modelId: "claude-sonnet-4-5",
        maxTurns: 8,
        maxBudgetUsd: 5,
        timeoutMs: 300_000,
      },
      toolConfig: {
        permissionMode: "auto",
        allowedTools: ["Read", "Edit"],
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

    expect(runRecordSchema.parse({
      id: "cf4f8129-d4f6-4747-8d32-bf1015218d30",
      iterationId: "ecec15a7-c4e4-4fbe-9a3d-7ee43f3d8b8a",
      evalSnapshotId: "40be6a74-e2d4-466c-bb09-65b1bb007e56",
      config: "with_skill",
      status: "queued",
      provider: "claude-code",
      modelId: "claude-sonnet-4-5",
      templateHash: "a".repeat(64),
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

    expect(gradeSchema.parse({
      runId: "cf4f8129-d4f6-4747-8d32-bf1015218d30",
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

    expect(benchmarkSchema.parse({
      iterationId: "ecec15a7-c4e4-4fbe-9a3d-7ee43f3d8b8a",
      benchmarkHash: "benchmark-hash-123",
      generatedAt: new Date().toISOString(),
      comparablePairCount: 1,
      excludedPairCount: 0,
      configs: [
        {
          config: "with_skill",
          passRate: 1,
          meanPassCount: { mean: 1, stddev: 0 },
          durationMs: { mean: 2500, stddev: 0 },
          totalTokens: { mean: 1234, stddev: 0 },
          totalCostUsd: { mean: 0.02, stddev: 0 },
        },
        {
          config: "without_skill",
          passRate: 0,
          meanPassCount: { mean: 0, stddev: 0 },
          durationMs: { mean: 2200, stddev: 0 },
          totalTokens: { mean: 1000, stddev: 0 },
          totalCostUsd: { mean: 0.018, stddev: 0 },
        },
      ],
      deltaAgainstBaseline: {
        passRateDelta: 1,
        durationMsDelta: 300,
        tokenDelta: 234,
        costDeltaUsd: 0.002,
      },
    }).configs[0]?.passRate).toBe(1);

    expect(reviewDecisionSchema.parse({
      pairId: "cabda8d1-5ba2-410d-a645-918758af4d7c",
      status: "graded",
      assignment: {
        primary: "candidate_a",
        baseline: "candidate_b",
      },
      notes: "Candidate A was more complete.",
      revealedAt: null,
    }).assignment.primary).toBe("candidate_a");
  });

  it("exposes the constrained status enums", () => {
    expect(skillVersionStatuses).toContain("accepted");
    expect(evalSetStatuses).toContain("frozen");
    expect(iterationStatuses).toContain("reviewing");
    expect(runStatuses).toContain("failed");
    expect(comparablePairStatuses).toContain("graded");
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

    expect(() => validateSkillTransition("draft", "accepted")).toThrow(InvalidTransitionError);
  });
});
