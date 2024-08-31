import { z } from "zod";

export const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  WOV_API_KEY: z.string(),
  AUTH_CODE_LENGTH: z.coerce.number().default(6),
  AUTH_CODE_TTL: z.coerce.number().default(15 * 60 * 1000),
});

export type Env = z.infer<typeof envSchema>;
