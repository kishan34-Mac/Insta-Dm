import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),

  password: z.string().min(8, "At least 8 characters").max(100),
});

export const signupSchema = loginSchema.extend({
  name: z.string().trim().min(2, "Enter your name").max(80),

  // NEW
  isAdmin: z.boolean().optional(),

  // Secret key required only when registering as admin
  adminSecret: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (!value) return true;
        return value.length >= 6;
      },
      {
        message: "Secret key must be at least 6 characters",
      },
    ),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
