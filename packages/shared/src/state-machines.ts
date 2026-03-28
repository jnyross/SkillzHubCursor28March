import type {
  ComparablePairStatus,
  EvalSetStatus,
  IterationStatus,
  RunStatus,
  SkillVersionStatus,
} from "./enums";

type TransitionMap<TState extends string> = {
  readonly [K in TState]: readonly TState[];
};

export const SKILL_VERSION_TRANSITIONS = {
  draft: ["frozen", "abandoned"],
  frozen: ["accepted", "abandoned"],
  accepted: ["superseded"],
  superseded: [],
  abandoned: [],
} as const satisfies TransitionMap<SkillVersionStatus>;

export const EVAL_SET_TRANSITIONS = {
  draft: ["frozen"],
  frozen: [],
} as const satisfies TransitionMap<EvalSetStatus>;

export const ITERATION_TRANSITIONS = {
  draft: ["queued", "failed"],
  queued: ["running", "failed", "completed"],
  running: ["reviewing", "failed", "completed"],
  reviewing: ["completed", "failed"],
  completed: [],
  failed: [],
} as const satisfies TransitionMap<IterationStatus>;

export const RUN_TRANSITIONS = {
  queued: ["running", "canceled", "failed"],
  running: ["succeeded", "failed", "canceled"],
  succeeded: [],
  failed: [],
  canceled: [],
} as const satisfies TransitionMap<RunStatus>;

export const COMPARABLE_PAIR_TRANSITIONS = {
  pending: ["comparable", "excluded"],
  comparable: ["graded", "excluded"],
  graded: [],
  excluded: [],
} as const satisfies TransitionMap<ComparablePairStatus>;

export function createTransitionValidator<TState extends string>(
  entityName: string,
  transitions: TransitionMap<TState>,
) {
  return (from: TState, to: TState) => {
    const allowed = transitions[from] ?? [];

    if (!allowed.includes(to)) {
      throw new Error(`${entityName} cannot transition from ${from} to ${to}`);
    }

    return true;
  };
}

export const transitionSkillVersion = createTransitionValidator(
  "SkillVersion",
  SKILL_VERSION_TRANSITIONS,
);

export const transitionEvalSet = createTransitionValidator(
  "EvalSet",
  EVAL_SET_TRANSITIONS,
);

export const transitionIteration = createTransitionValidator(
  "Iteration",
  ITERATION_TRANSITIONS,
);

export const transitionRun = createTransitionValidator("Run", RUN_TRANSITIONS);

export const transitionComparablePair = createTransitionValidator(
  "ComparablePair",
  COMPARABLE_PAIR_TRANSITIONS,
);
