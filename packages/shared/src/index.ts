export * from "./claude";
export * from "./config";
export * from "./enums";
export * from "./errors";
export * from "./logger";
export * from "./schemas";
export * from "./state-machines";

export const sharedPackageName = "@skill-builder/shared";

export function describePhaseZeroReadiness() {
  return {
    package: sharedPackageName,
    status: "bootstrapped",
  } as const;
}
