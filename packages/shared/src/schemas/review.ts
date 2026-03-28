import { z } from "zod";

import { comparablePairStatusSchema } from "../enums";

export const blindReviewCandidateLabelSchema = z.enum(["candidate_a", "candidate_b"]);

export const blindReviewAssignmentSchema = z.object({
  primary: blindReviewCandidateLabelSchema,
  baseline: blindReviewCandidateLabelSchema,
});

export const reviewDecisionSchema = z.object({
  pairId: z.string().uuid(),
  status: comparablePairStatusSchema,
  assignment: blindReviewAssignmentSchema,
  notes: z.string().trim().max(10_000),
  revealedAt: z.string().datetime().nullable().default(null),
});

export type BlindReviewAssignment = z.infer<typeof blindReviewAssignmentSchema>;
export type ReviewDecision = z.infer<typeof reviewDecisionSchema>;
