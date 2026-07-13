import { z } from "zod";

export const disconnectInstagramSchema = z.object({
  params: z.object({
    igUserId: z.string().regex(/^[0-9]+$/, "Instagram User ID must be a numeric string"),
  }).strict(),
});

export const webhookVerificationSchema = z.object({
  query: z.object({
    "hub.mode": z.string().max(50).optional(),
    "hub.verify_token": z.string().max(256).optional(),
    "hub.challenge": z.string().max(256).optional(),
  }).passthrough(), // Allow other query params from webhook providers
});
