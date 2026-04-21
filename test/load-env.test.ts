import assert from "node:assert/strict";
import test from "node:test";

import { loadEnv } from "../src";

function withEnv(vars: Record<string, string | undefined>, fn: () => void): void {
  const previous: Record<string, string | undefined> = {};

  for (const key of Object.keys(vars)) {
    previous[key] = process.env[key];
    const value = vars[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  try {
    fn();
  } finally {
    for (const key of Object.keys(vars)) {
      const value = previous[key];
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

test("parses strict schema values", () => {
  withEnv({ PORT: "3000", DEBUG: "true", DATABASE_URL: "postgres://db" }, () => {
    const env = loadEnv({
      PORT: "number",
      DEBUG: "boolean",
      DATABASE_URL: "string",
    });

    assert.deepEqual(env, {
      PORT: 3000,
      DEBUG: true,
      DATABASE_URL: "postgres://db",
    });
  });
});

test("treats whitespace-only values as missing", () => {
  withEnv({ PORT: "   " }, () => {
    assert.throws(
      () => loadEnv({ PORT: "number" }),
      (error: unknown) =>
        error instanceof Error && error.message === "Missing environment variable: PORT",
    );
  });
});

test("accepts uppercase and mixed-case boolean values", () => {
  withEnv({ DEBUG_A: "TRUE", DEBUG_B: "False" }, () => {
    const env = loadEnv({
      DEBUG_A: "boolean",
      DEBUG_B: "boolean",
    });

    assert.deepEqual(env, {
      DEBUG_A: true,
      DEBUG_B: false,
    });
  });
});

test("rejects Infinity for numbers", () => {
  withEnv({ PORT: "Infinity" }, () => {
    assert.throws(
      () => loadEnv({ PORT: "number" }),
      (error: unknown) =>
        error instanceof Error &&
        error.message ===
          'Invalid environment variable: PORT\n  Expected: number\n  Received: "Infinity"',
    );
  });
});

test("trims values before parsing", () => {
  withEnv({ PORT: " 123 ", DEBUG: " True ", DATABASE_URL: "  postgres://db  " }, () => {
    const env = loadEnv({
      PORT: "number",
      DEBUG: "boolean",
      DATABASE_URL: "string",
    });

    assert.deepEqual(env, {
      PORT: 123,
      DEBUG: true,
      DATABASE_URL: "postgres://db",
    });
  });
});

test("throws when boolean env is invalid", () => {
  withEnv({ DEBUG: "1" }, () => {
    assert.throws(
      () => loadEnv({ DEBUG: "boolean" }),
      (error: unknown) =>
        error instanceof Error &&
        error.message ===
          'Invalid environment variable: DEBUG\n  Expected: boolean\n  Received: "1"',
    );
  });
});
