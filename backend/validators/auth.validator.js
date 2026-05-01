import { z } from "zod";
import { AppError } from "../utils/errorHandler.js";

const email = z.string().trim().email().max(255).transform((value) => value.toLowerCase());
const password = z.string().min(8).max(100);

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    email,
    password,
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email,
    password,
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
});

export const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1).optional(),
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

  req.body = result.data.body ?? req.body;
  return next();
};
