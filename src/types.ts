export type EnvType = "string" | "number" | "boolean";

export type EnvSchema = Record<string, EnvType>;

export type EnvValue<T extends EnvType> =
  T extends "string" ? string : T extends "number" ? number : boolean;

export type EnvFromSchema<TSchema extends EnvSchema> = {
  [K in keyof TSchema]: EnvValue<TSchema[K]>;
};
