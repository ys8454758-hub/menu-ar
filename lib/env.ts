// lib/env.ts - Environment variable validation with Zod
import { z } from "zod";

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase anon key required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "Supabase service role key required"),
  DATABASE_URL: z.string().url("Invalid DATABASE_URL"),
  DIRECT_URL: z.string().url("Invalid DIRECT_URL").optional().or(z.literal("")),

  // Auth
  NEXT_PUBLIC_BASE_URL: z.string().url("Invalid BASE_URL").optional().or(z.literal("")),

  // Email (Resend)
  RESEND_API_KEY: z.string().min(1, "Resend API key required").optional().or(z.literal("")),

  // Billing (Razorpay)
  RAZORPAY_KEY_ID: z.string().min(1, "Razorpay key ID required").optional().or(z.literal("")),
  RAZORPAY_KEY_SECRET: z.string().min(1, "Razorpay secret required").optional().or(z.literal("")),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1, "Razorpay webhook secret required").optional().or(z.literal("")),

  // Cron
  CRON_SECRET: z.string().min(1, "Cron secret required").optional().or(z.literal("")),
});

export type EnvConfig = z.infer<typeof envSchema>;

let envConfig: EnvConfig | null = null;

export function validateEnv() {
  if (envConfig) {
    return envConfig;
  }

  const result = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
    CRON_SECRET: process.env.CRON_SECRET,
  });

  if (!result.success) {
    const errors = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("\n");
    throw new Error(`Environment validation failed:\n${errors}`);
  }

  envConfig = result.data;
  return envConfig;
}

// Export validated env
export const env = validateEnv();
