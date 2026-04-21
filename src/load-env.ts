import { EnvGuardError } from "./errors";
import type { EnvFromSchema, EnvSchema, EnvType } from "./types";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isEnvType(value: unknown): value is EnvType {
  return value === "string" || value === "number" || value === "boolean";
}

function missingError(key: string): EnvGuardError {
  return new EnvGuardError("MISSING_ENV", `Missing environment variable: ${key}`);
}

function invalidError(key: string, expected: EnvType, received: string): EnvGuardError {
  return new EnvGuardError(
    "INVALID_ENV",
    `Invalid environment variable: ${key}\n  Expected: ${expected}\n  Received: "${received}"`,
  );
}

function parseValue(key: string, expected: EnvType, received: string): string | number | boolean {
  switch (expected) {
    case "string":
      return received;
    case "number": {
      const parsed = Number(received);
      if (!Number.isFinite(parsed)) {
        throw invalidError(key, expected, received);
      }
      return parsed;
    }
    case "boolean": {
      const lowered = received.toLowerCase();
      if (lowered === "true") {
        return true;
      }
      if (lowered === "false") {
        return false;
      }
      throw invalidError(key, expected, received);
    }
    default:
      throw new EnvGuardError("INVALID_SCHEMA", `Unsupported schema type for '${key}'.`);
  }
}

export function loadEnv<TSchema extends EnvSchema>(schema: TSchema): EnvFromSchema<TSchema> {
  if (!isPlainObject(schema)) {
    throw new EnvGuardError("INVALID_SCHEMA", "Schema must be a plain object.");
  }

  const env: Record<string, string | number | boolean> = {};

  for (const [key, expected] of Object.entries(schema)) {
    if (!isEnvType(expected)) {
      throw new EnvGuardError(
        "INVALID_SCHEMA",
        `Schema value for '${key}' must be 'string', 'number', or 'boolean'.`,
      );
    }

    const raw = process.env[key];
    if (raw === undefined) {
      throw missingError(key);
    }

    const normalized = raw.trim();
    if (normalized === "") {
      throw missingError(key);
    }

    env[key] = parseValue(key, expected, normalized);
  }

  return env as EnvFromSchema<TSchema>;
}
