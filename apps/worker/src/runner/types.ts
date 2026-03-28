export type RunnerInputFile = {
  path: string;
  content: string;
};

export type RunnerExecutionInput = {
  prompt: string;
  projectId: string;
  iterationId: string;
  runId: string;
  model?: string;
  skillName: string;
  skillFiles: RunnerInputFile[];
  inputFiles: RunnerInputFile[];
  allowedTools?: string[];
  maxTurns?: number;
  maxBudgetUsd?: number;
  timeoutMs?: number;
};

export type RunnerOutputFile = {
  path: string;
  sha256: string;
  sizeBytes: number;
};

export type RunnerExecutionOutput =
  | {
      status: "succeeded";
      provider: "claude-code";
      modelId: string | null;
      totalTokens: number | null;
      durationMs: number | null;
      totalCostUsd: number | null;
      transcriptUri: string | null;
      outputFiles: RunnerOutputFile[];
      rawStdout: string;
      rawStderr: string;
      failureReason: null;
    }
  | {
      status: "failed";
      provider: "claude-code";
      modelId: string | null;
      totalTokens: number | null;
      durationMs: number | null;
      totalCostUsd: number | null;
      transcriptUri: string | null;
      outputFiles: RunnerOutputFile[];
      rawStdout: string;
      rawStderr: string;
      failureReason: string;
    };
