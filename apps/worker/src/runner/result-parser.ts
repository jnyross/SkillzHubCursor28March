export type ParsedClaudeResult = {
  sessionId: string | null;
  modelId: string | null;
  totalCostUsd: number | null;
  durationMs: number | null;
  totalTurns: number | null;
  resultText: string;
  isError: boolean;
  failureReason: string | null;
};

export function parseClaudeResult(raw: string): ParsedClaudeResult {
  const parsed = JSON.parse(raw) as {
    result?: string;
    session_id?: string;
    cost_usd?: number;
    duration_ms?: number;
    num_turns?: number;
    is_error?: boolean;
    model?: string;
  };

  return {
    sessionId: parsed.session_id ?? null,
    modelId: parsed.model ?? null,
    totalCostUsd: parsed.cost_usd ?? null,
    durationMs: parsed.duration_ms ?? null,
    totalTurns: parsed.num_turns ?? null,
    resultText: parsed.result ?? "",
    isError: parsed.is_error ?? false,
    failureReason: parsed.is_error ? (parsed.result ?? "Claude returned an error.") : null,
  };
}
