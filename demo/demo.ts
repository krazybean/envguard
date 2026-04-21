import { loadEnv } from "../src";

function separator(title: string): void {
  console.log("\n---");
  console.log(title);
  console.log();
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

console.log("envguard demo");
separator("✓ Scenario 1: Valid configuration");
process.env.PORT = "3000";
process.env.DEBUG = "true";

try {
  const env = loadEnv({
    PORT: "number",
    DEBUG: "boolean",
  });

  console.log(`PORT  \u2192 ${env.PORT} (${typeof env.PORT})`);
  console.log(`DEBUG \u2192 ${env.DEBUG} (${typeof env.DEBUG})`);
} catch (error) {
  console.log("✗ Unexpected error");
  console.log(getErrorMessage(error));
}

separator("✗ Scenario 2: Missing variable");
delete process.env.PORT;

try {
  loadEnv({
    PORT: "number",
    DEBUG: "boolean",
  });
} catch (error) {
  console.log(getErrorMessage(error));
}

separator("✗ Scenario 3: Invalid type");
process.env.PORT = "abc";

try {
  loadEnv({
    PORT: "number",
    DEBUG: "boolean",
  });
} catch (error) {
  console.log(getErrorMessage(error));
}
