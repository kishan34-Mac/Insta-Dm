import Razorpay from "razorpay";
import crypto from "crypto";

import env from "../config/env.js";
import { AppError } from "../utils/errorHandler.js";
import User from "../models/User.js";
import Payment from "../models/Payment.js";

import { sendSuccess } from "../utils/apiResponse.js";

let _razorpay;
function getRazorpay() {
  if (!_razorpay) {
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      throw new AppError("Razorpay not configured – set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env", 500);
    }
    _razorpay = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }
  return _razorpay;
}

const BILLING_PLANS = {
  STARTER: { key: "starter", amountPaise: 49900 },
  PRO: { key: "pro", amountPaise: 99900 },
  AGENCY: { key: "agency", amountPaise: 249900 },
};

const normalizePlanKey = (plan) => {
  if (plan == null) return null;
  if (typeof plan !== "string") {
    // allow already-normalized lower-case keys
    if (typeof plan === "string") return plan;
    return null;
  }

  const normalized = plan.trim().toUpperCase();
  if (!normalized) return null;
  if (!Object.prototype.hasOwnProperty.call(BILLING_PLANS, normalized)) {
    // also allow direct lower-case plan keys (starter/pro/agency)
    const direct = plan.trim().toLowerCase();
    if (["starter", "pro", "agency"].includes(direct)) return direct;
    return null;
  }

  return BILLING_PLANS[normalized].key;
};

const amountForPlanKey = (planKey) => {
  if (planKey === "starter") return BILLING_PLANS.STARTER.amountPaise;
  if (planKey === "pro") return BILLING_PLANS.PRO.amountPaise;
  if (planKey === "agency") return BILLING_PLANS.AGENCY.amountPaise;
  return null;
};

// Razorpay receipt max length is 40 characters.
const buildOrderReceipt = (userId) => {
  const suffix = String(userId).slice(-8);
  const receipt = `rcpt_${suffix}_${Date.now()}`;
  return receipt.slice(0, 40);
};

export const createRazorpayOrder = async (req, res, next) => {
  try {
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      throw new AppError("Razorpay not configured", 500);
    }

    console.log("[billing:create-order] req.body:", req.body);
    console.log("[billing:create-order] has auth header:", !!req.headers.authorization);

    const incomingPlan = req.body?.plan ?? null;
    const requestedPlan = normalizePlanKey(incomingPlan);

    console.log("[billing:create-order] incomingPlan:", incomingPlan);
    console.log("[billing:create-order] requestedPlan:", requestedPlan);

    if (!requestedPlan) {
      throw new AppError(
        `Invalid plan selected. Received plan: ${String(incomingPlan)}. Allowed: STARTER, PRO, AGENCY`,
        400
      );
    }

    const amount = amountForPlanKey(requestedPlan);
    if (!amount) {
      throw new AppError(`No pricing configured for plan: ${requestedPlan}`, 500);
    }


    if (!req.userId) {
      throw new AppError("User not found in request context", 401);
    }

    const userId = req.userId;


    // mark pending on order creation (until verify/webhook activates)
    await User.findByIdAndUpdate(userId, {
      currentBillingPlan: requestedPlan,
      billingStatus: "pending",
    });

    const order = await getRazorpay().orders.create({
      amount,
      currency: env.RAZORPAY_CURRENCY || "INR",
      receipt: buildOrderReceipt(userId),
      payment_capture: 1,
      notes: {
        userId: String(userId),
        plan: requestedPlan,
      },
    });

    // persist pending payment history (do not trust frontend amount)
    await Payment.create({
      userId,
      razorpayOrderId: order.id,
      razorpayPaymentId: null,
      razorpaySignature: null,
      amount,
      currency: order.currency || env.RAZORPAY_CURRENCY || "INR",
      status: "pending",
      plan: requestedPlan,
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
    const razorpayError = err?.error;
    if (razorpayError?.description) {
      return next(
        new AppError(
          `Razorpay order failed: ${razorpayError.description}`,
          400
        )
      );
    }
    next(err);
  }
};

export const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
    } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new AppError("Missing payment verification fields", 400);
    }

    const expected = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      throw new AppError("Payment verification failed: invalid signature", 400);
    }

    const userId = req.userId;
    if (!userId) {
      throw new AppError("User not found in request context", 401);
    }

    // Never trust plan/amount from frontend. Use stored Payment record.
    const payment = await Payment.findOne({
      userId,
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      throw new AppError("Order not found for this user", 404);
    }

    const requestedPlan = normalizePlanKey(plan);
    if (requestedPlan && payment.plan !== requestedPlan) {
      throw new AppError("Plan mismatch for this payment", 400);
    }

    if (!amountForPlanKey(payment.plan)) {
      throw new AppError("Invalid stored payment plan", 500);
    }

    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = "captured";
    await payment.save();

    const now = new Date();
    const startDate = now;
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 1);

    await User.findByIdAndUpdate(userId, {
      subscriptionStatus: "active",
      subscriptionStartDate: startDate,
      subscriptionEndDate: endDate,
      plan: payment.plan,
      billingStatus: "active",
      currentBillingPlan: payment.plan,
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
    const paymentEntity =
      event?.payload?.payment?.entity || event?.payload?.payment || {};

    const orderId =
      paymentEntity?.order_id ||
      event?.payload?.payment?.entity?.order_id ||
      null;

    const notes =
      paymentEntity?.notes ||
      event?.payload?.payment?.entity?.notes ||
      {};

    const userId = notes?.userId;
    const paidPlan = normalizePlanKey(notes?.plan);

    if (!userId || !orderId) {
      // can still acknowledge to avoid retries
      return res.status(200).send("OK");
    }

    const status = paymentEntity?.status;
    const active = status === "captured" || status === "authorized";

    const paymentDoc = await Payment.findOne({
      userId,
      razorpayOrderId: orderId,
    });

    if (paymentDoc) {
      paymentDoc.razorpayPaymentId =
        paymentEntity?.id || paymentDoc.razorpayPaymentId;
      paymentDoc.razorpaySignature = null;
      paymentDoc.plan = paidPlan || paymentDoc.plan;
      paymentDoc.status = active ? "captured" : "failed";
      await paymentDoc.save();
    }

    if (active) {
      await User.findByIdAndUpdate(userId, {
        subscriptionStatus: "active",
        subscriptionStartDate: new Date(),
        subscriptionEndDate: (() => {
          const d = new Date();
          d.setMonth(d.getMonth() + 1);
          return d;
        })(),
        plan: paidPlan,
        billingStatus: "active",
        currentBillingPlan: paidPlan,
        razorpayOrderId: orderId,
      });
    } else {
      await User.findByIdAndUpdate(userId, {
        subscriptionStatus: "failed",
        billingStatus: "failed",
        razorpayOrderId: orderId,
      });

      if (paymentDoc) {
        await Payment.updateOne(
          { _id: paymentDoc._id },
          { $set: { status: "failed" } }
        );
      }
    }


    return res.status(200).send("OK");
  } catch (err) {
    // Always respond 200 to avoid retry storms, but log error
    console.error("❌ Razorpay webhook error:", err?.message || err);
    return res.status(200).send("OK");
  }
};

