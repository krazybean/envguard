export class EnvGuardError extends Error {
  public readonly code: "INVALID_SCHEMA" | "MISSING_ENV" | "INVALID_ENV";

  public constructor(
    code: "INVALID_SCHEMA" | "MISSING_ENV" | "INVALID_ENV",
    message: string,
  ) {
    super(message);
    this.code = code;
    this.name = "EnvGuardError";
  }
}
