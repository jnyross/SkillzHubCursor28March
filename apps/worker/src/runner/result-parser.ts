import { z } from "zod";

const claudePrintResultSchema = z.object({
  result: z.string().default(""),
  session_id: z.string().min(1).optional(),
  cost_usd: z.number().nonnegative().optional(),
  duration_ms: z.number().int().nonnegative().optional(),
  num_turns: z.number().int().nonnegative().optional(),
  is_error: z.boolean().optional(),
  model: z.string().optional(),
});

export type ClaudePrintResult = z.infer<typeof claudePrintResultSchema>;

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

export function parseClaudeJsonResult(raw: string): ClaudePrintResult {
  return claudePrintResultSchema.parse(JSON.parse(raw));
}

export function parseClaudeResult(raw: string): ParsedClaudeResult {
  const parsed = parseClaudeJsonResult(raw);

  return {
    sessionId: parsed.session_id ?? null,
    modelId: parsed.model ?? null,
    totalCostUsd: parsed.cost_usd ?? null,
    durationMs: parsed.duration_ms ?? null,
    totalTurns: parsed.num_turns ?? null,
    resultText: parsed.result,
    isError: parsed.is_error ?? false,
    failureReason: parsed.is_error ? parsed.result : null,
  };
}
