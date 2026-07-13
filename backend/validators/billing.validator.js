import { z } from "zod";

export const createOrderSchema = z.object({
  body: z.object({
    plan: z.enum(["starter", "pro", "agency", "STARTER", "PRO", "AGENCY"]),
  }).strict(),
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    razorpay_order_id: z.string().min(1, "Razorpay Order ID is required").max(100),
    razorpay_payment_id: z.string().min(1, "Razorpay Payment ID is required").max(100),
    razorpay_signature: z.string().min(1, "Razorpay Signature is required").max(256),
    plan: z.string().max(50).optional(),
  }).strict(),
});
