import { z } from "zod";
import { AppError } from "../utils/errorHandler.js";

const email = z
  .string()
  .trim()
  .email("Provide a valid email address")
  .max(255)
  .transform((value) => value.toLowerCase());

// Enterprise level password requirements
const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password is too long")
  .refine(
    (val) => /[A-Z]/.test(val) && /[a-z]/.test(val) && /[0-9]/.test(val),
    { message: "Password must contain at least one uppercase letter, one lowercase letter, and one number" }
  );

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
    email,
    password,
    plan: z.enum(["free", "starter", "pro", "agency"]).optional(),
    isAdmin: z.boolean().optional(),
    adminSecret: z.string().optional(),
  }).strict(),
});

export const loginSchema = z.object({
  body: z.object({
    email,
    password: z.string().min(1, "Password required"),
    isAdmin: z.boolean().optional(),
    adminSecret: z.string().optional(),
  }).strict(),
});

export const refreshTokenSchema = z.object({
  body: z.object({}).strict(),
  query: z.object({}).strict(),
});

export const logoutSchema = z.object({
  body: z.object({}).strict(),
  query: z.object({}).strict(),
});

export const googleAuthSchema = z.object({
  body: z.object({
    credential: z.string().min(1, "Google credential is required"),
    mode: z.enum(["login", "signup"]),
    plan: z.enum(["free", "starter", "pro", "agency"]).optional(),
  }).strict(),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email,
  }).strict(),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Reset token is required"),
    password,
  }).strict(),
});

export const verifyEmailSchema = z.object({
  query: z.object({
    token: z.string().min(1, "Verification token is required"),
  }).strict(),
});

export const resendVerificationSchema = z.object({
  body: z.object({
    email,
  }).strict(),
});

export const mfaSetupSchema = z.object({
  body: z.object({}).strict(),
  query: z.object({}).strict(),
});

export const mfaVerifySchema = z.object({
  body: z
    .object({
      code: z.string().length(6, "MFA code must be exactly 6 digits").optional(),
      tempToken: z.string().min(1, "MFA session token is required").optional(),
      recoveryCode: z.string().min(1, "Recovery code is required").optional(),
    })
    .strict()
    .refine((data) => data.code || data.recoveryCode, {
      message: "Either MFA code or recovery code must be provided",
    }),
});

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!result.success) {
    return next(
      new AppError("Validation failed", 400, {
        details: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      }),
    );
  }

  if (result.data.body !== undefined) req.body = result.data.body;
  if (result.data.params !== undefined) req.params = result.data.params;
  if (result.data.query !== undefined) req.query = result.data.query;

  return next();
};
