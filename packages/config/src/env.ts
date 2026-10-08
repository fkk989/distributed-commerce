import { z } from "zod";

export const baseEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
  SERVICE_NAME: z.string().min(1),
});

export type BaseEnv = z.infer<typeof baseEnvSchema>;
export type EnvSource = Record<string, string | undefined>;

export function createEnv<T extends z.ZodRawShape>(
  extension: T,
  source: EnvSource,
) {
  const schema = baseEnvSchema.extend(extension);
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return parsed.data;
}
