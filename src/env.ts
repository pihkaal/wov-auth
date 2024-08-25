import { z } from "zod";

export const envSchema = z.object({
  WOV_API_KEY: z.string(),
  AUTH_CODE_LENGTH: z.coerce.number().default(6),
});

export type Env = z.infer<typeof envSchema>;
