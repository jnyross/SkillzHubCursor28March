import { z } from "zod";

export const gradeExpectationSchema = z.object({
  text: z.string().min(1),
  passed: z.boolean(),
  evidence: z.string().min(1),
});

export const gradeSchema = z.object({
  id: z.string().uuid().optional(),
  runId: z.string().uuid(),
  graderVersion: z.string().min(1),
  grading: z.object({
    expectations: z.array(gradeExpectationSchema),
  }),
  completedAt: z.string().datetime().nullable().default(null),
});

export type GradeExpectation = z.infer<typeof gradeExpectationSchema>;
export type Grade = z.infer<typeof gradeSchema>;
