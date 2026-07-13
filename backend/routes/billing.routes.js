import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../validators/auth.validator.js";
import { createOrderSchema, verifyPaymentSchema } from "../validators/billing.validator.js";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../controllers/billing.controller.js";

const router = express.Router();

router.post(
  "/razorpay/create-order",
  protect,
  validate(createOrderSchema),
  createRazorpayOrder
);

router.post(
  "/razorpay/verify",
  protect,
  validate(verifyPaymentSchema),
  verifyRazorpayPayment
);

// Webhook route is mounted with raw-body parsing in server.js

export default router;


