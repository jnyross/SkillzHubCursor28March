export * from "./claude";

export const sharedPackageName = "@skill-builder/shared";

export function describePhaseZeroReadiness() {
  return {
    package: sharedPackageName,
    status: "bootstrapped",
  } as const;
}
