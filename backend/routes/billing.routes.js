import express from "express";

import { protect } from "../middleware/auth.middleware.js";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../controllers/billing.controller.js";

const router = express.Router();

router.post(
  "/razorpay/create-order",
  protect,
  createRazorpayOrder
);

router.post(
  "/razorpay/verify",
  protect,
  verifyRazorpayPayment
);

// Webhook route is mounted with raw-body parsing in server.js

export default router;


