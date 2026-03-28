export class DomainError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export class InvalidTransitionError extends DomainError {
  constructor(entity: string, from: string, to: string) {
    super(`Invalid ${entity} transition from ${from} to ${to}.`, "INVALID_TRANSITION");
    this.name = "InvalidTransitionError";
  }
}
