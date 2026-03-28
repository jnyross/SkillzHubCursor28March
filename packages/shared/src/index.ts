export * from "./claude";
export * from "./enums";
export * from "./errors";
export * from "./schemas";
export * from "./state-machines";
export * from "./config";
export * from "./logger";

export const sharedPackageName = "@skill-builder/shared";

export function describePhaseZeroReadiness() {
  return {
    package: sharedPackageName,
    status: "bootstrapped",
  } as const;
}
