import { fileURLToPath } from "url";
import { resolve, dirname } from "path";
import dotenv from "dotenv";
import { z } from "zod";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../../../../.env") });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  CLIENT_URL: z.string().url().default("http://localhost:5173"),
  CLIENT_URLS: z.string().optional(),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  MONGODB_URI_FALLBACK: z.string().optional(),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  OTP_EXPIRES_MINUTES: z.coerce.number().int().positive().default(10),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM_EMAIL: z.string().optional(),
  SMTP_FROM_NAME: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRO_PRICE_ID: z.string().optional(),
  STRIPE_BUSINESS_PRICE_ID: z.string().optional(),
  SEND_PORTAL_LINK_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  SEND_PORTAL_LINK_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
  LOGIN_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  LOGIN_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  REGISTER_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(3600000),
  REGISTER_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  OTP_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(300000),
  OTP_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
  UPLOAD_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  UPLOAD_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
  AI_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  AI_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10)
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;