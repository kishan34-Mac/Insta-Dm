import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5002),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  FRONTEND_URL: z.string().url().default("http://localhost:8080"),

  MONGO_URL: z.string().min(1, "MONGO_URL is required"),

  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters"),

  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),

  JWT_EXPIRES_IN: z.string().default("1h"),

  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  ENCRYPTION_KEY: z
    .string()
    .min(32, "ENCRYPTION_KEY must be at least 32 characters"),

  META_VERIFY_TOKEN: z.string().min(1, "META_VERIFY_TOKEN is required"),

  FACEBOOK_APP_ID: z.string().min(1, "FACEBOOK_APP_ID is required"),

  FACEBOOK_APP_SECRET: z.string().min(1, "FACEBOOK_APP_SECRET is required"),

  INSTAGRAM_CLIENT_ID: z.string().min(1, "INSTAGRAM_CLIENT_ID is required"),

  INSTAGRAM_CLIENT_SECRET: z
    .string()
    .min(1, "INSTAGRAM_CLIENT_SECRET is required"),

  INSTAGRAM_REDIRECT_URI: z
    .string()
    .url()
    .default("http://localhost:8002/api/v1/instagram/callback"),

  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),

  RAZORPAY_KEY_ID: z.string().min(1, "RAZORPAY_KEY_ID is required"),

  RAZORPAY_KEY_SECRET: z.string().min(1, "RAZORPAY_KEY_SECRET is required"),

  RAZORPAY_WEBHOOK_SECRET: z
    .string()
    .min(1, "RAZORPAY_WEBHOOK_SECRET is required"),

  ADMIN_SECRET: z.string().default("DMPILOT@2026"),

  ADMIN_EMAIL: z.string().email().default("kishan122@gmail.com"),

  ADMIN_PASSWORD: z.string().default("Kishan21"),

  RAZORPAY_CURRENCY: z.string().default("INR"),
});

const parsed = envSchema.safeParse({
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  ADMIN_SECRET: process.env.ADMIN_SECRET,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  FRONTEND_URL: process.env.FRONTEND_URL,
  MONGO_URL: process.env.MONGO_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  META_VERIFY_TOKEN:
    process.env.META_WEBHOOK_VERIFY_TOKEN || process.env.META_VERIFY_TOKEN,
  FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET,
  INSTAGRAM_CLIENT_ID: process.env.INSTAGRAM_CLIENT_ID,
  INSTAGRAM_CLIENT_SECRET: process.env.INSTAGRAM_CLIENT_SECRET,
  INSTAGRAM_REDIRECT_URI: process.env.INSTAGRAM_REDIRECT_URI,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
  RAZORPAY_CURRENCY: process.env.RAZORPAY_CURRENCY,
});

if (!parsed.success) {
  console.error("❌ Environment validation error:", parsed.error.format());
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
}

// Export parsed environment configuration with fallback to raw process.env values in case of schema validation failures during local dev
const env = parsed.success
  ? parsed.data
  : { ...process.env, ...parsed.data };

export default env;
