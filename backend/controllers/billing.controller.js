import Razorpay from "razorpay";
import crypto from "crypto";

import env from "../config/env.js";
import { AppError } from "../utils/errorHandler.js";
import User from "../models/User.js";
import { sendSuccess } from "../utils/apiResponse.js";

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

const PLAN_TO_PRICE_PAISA = {
  starter: 2900,
  pro: 7900,
  agency: 19900,
};

const normalizePlan = (plan) => {
  if (plan == null) return null;

  if (typeof plan !== "string") return null;

  const normalized = plan.trim().toLowerCase();
  if (!normalized) return null;

  if (normalized === "free") return "free";
  if (["starter", "pro", "agency"].includes(normalized)) return normalized;

  return null;
};


export const createRazorpayOrder = async (req, res, next) => {
  try {
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      throw new AppError("Razorpay not configured", 500);
    }

    console.log("[billing:create-order] req.body:", req.body);
    console.log("[billing:create-order] has auth header:", !!req.headers.authorization);

    const incomingPlan = req.body?.plan ?? null;
    const requestedPlan = normalizePlan(incomingPlan);

    console.log("[billing:create-order] incomingPlan:", incomingPlan);
    console.log("[billing:create-order] requestedPlan:", requestedPlan);

    // Important: support both your defined enum and Razorpay-verified flows.
    // If requestedPlan is invalid, return a helpful message.
    if (!requestedPlan || requestedPlan === "free") {
      throw new AppError(
        `Invalid plan selected. Received plan: ${String(incomingPlan)}`,
        400
      );
    }

    const amount = PLAN_TO_PRICE_PAISA[requestedPlan];
    if (!amount) {
      throw new AppError(`No pricing configured for plan: ${requestedPlan}`, 400);
    }

    if (!req.userId) {
      throw new AppError("User not found in request context", 401);
    }

    const userId = req.userId;


    // mark pending on order creation (free trial until webhook/verification)
    await User.findByIdAndUpdate(userId, {
      currentBillingPlan: requestedPlan,
      billingStatus: "pending",
    });

    const order = await razorpay.orders.create({
      amount,
      currency: env.RAZORPAY_CURRENCY || "INR",
      receipt: `order_rcpt_${userId}_${Date.now()}`,
      payment_capture: 1,
      notes: {
        userId: String(userId),
        plan: requestedPlan,
      },
    });

    await User.findByIdAndUpdate(userId, {
      razorpayOrderId: order.id,
    });

    return sendSuccess(res, {
      message: "Razorpay order created",
      data: {
        keyId: env.RAZORPAY_KEY_ID,
        orderId: order.id,
        amount,
        currency: order.currency,
        plan: requestedPlan,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new AppError("Missing payment verification fields", 400);
    }

    const expected = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      throw new AppError("Invalid Razorpay signature", 400);
    }

    // If called, trust plan from payload; fallback to user currentBillingPlan
    const requestedPlan = normalizePlan(plan) || req.user?.currentBillingPlan || req.user?.plan;
    const userId = req.userId;

    await User.findByIdAndUpdate(userId, {
      billingStatus: "active",
      currentBillingPlan: requestedPlan,
      razorpayOrderId: razorpay_order_id,
    });

    return sendSuccess(res, {
      message: "Payment verified",
    });
  } catch (err) {
    next(err);
  }
};

// Webhook uses raw body; controller expects req.body to be already parsed as string/buffer
export const handleRazorpayWebhook = async (req, res, next) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    if (!signature) {
      throw new AppError("Missing Razorpay webhook signature", 400);
    }

    const payload = req.body;
    const payloadString = Buffer.isBuffer(payload)
      ? payload.toString("utf8")
      : typeof payload === "string"
        ? payload
        : JSON.stringify(payload);

    const expected = crypto
      .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
      .update(payloadString)
      .digest("hex");

    if (expected !== signature) {
      throw new AppError("Invalid Razorpay webhook signature", 400);
    }

    const event = JSON.parse(payloadString);
    const eventName = event?.event;

    // common fields: payload.payment.entity etc
    const payment = event?.payload?.payment?.entity || event?.payload?.payment || {};
    const order = event?.payload?.payment?.entity?.order_id
      ? { id: event.payload.payment.entity.order_id }
      : event?.payload?.payment?.entity?.order_id;

    const orderId = payment?.order_id || order?.id || event?.payload?.payment?.entity?.order_id;

    const notes = payment?.notes || event?.payload?.payment?.entity?.notes || {};
    const userId = notes?.userId;
    const paidPlan = normalizePlan(notes?.plan);

    if (!userId) {
      // can still acknowledge to avoid retries
      return res.status(200).send("OK");
    }

    // activate only on successful payment
    const status = payment?.status;
    const active = status === "captured" || status === "authorized";

    if (active) {
      await User.findByIdAndUpdate(userId, {
        billingStatus: "active",
        currentBillingPlan: paidPlan,
        razorpayOrderId: orderId || null,
      });
    } else {
      await User.findByIdAndUpdate(userId, {
        billingStatus: "failed",
        razorpayOrderId: orderId || null,
      });
    }

    return res.status(200).send("OK");
  } catch (err) {
    // Always respond 200 to avoid retry storms, but log error
    console.error("❌ Razorpay webhook error:", err?.message || err);
    return res.status(200).send("OK");
  }
};

