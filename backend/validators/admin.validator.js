import { z } from "zod";

export const getAdminListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().max(1000).default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.string().max(100).optional(),
    plan: z.enum(["free", "starter", "pro", "agency"]).optional(),
    status: z.string().max(50).optional(),
  }).strict(),
});

export const updateSubscriptionSchema = z.object({
  params: z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format"),
  }).strict(),
  body: z.object({
    plan: z.enum(["free", "starter", "pro", "agency"]),
    subscriptionStatus: z.enum(["free", "pending", "active", "failed"]),
  }).strict(),
});
