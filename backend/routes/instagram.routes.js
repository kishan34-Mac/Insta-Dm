import express from "express";

import {
  connectInstagram,
  instagramCallback,
  disconnectInstagram,
  getInstagramAccounts,
} from "../controllers/instagram.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

/* ==========================================
   HEALTH CHECK
========================================== */

router.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Instagram routes working 🚀",
  });
});

/* ==========================================
   CONNECT INSTAGRAM
========================================== */

router.get(
  "/connect",
  connectInstagram
);
/* ==========================================
   OAUTH CALLBACK
========================================== */

router.get(
  "/callback",
  instagramCallback
);

/* ==========================================
   GET CONNECTED ACCOUNTS
========================================== */
router.get(
  "/accounts",
  getInstagramAccounts
);

/* ==========================================
   DISCONNECT ACCOUNT
========================================== */

router.post(
  "/disconnect",
  protect,
  disconnectInstagram
);

/* ==========================================
   META WEBHOOK VERIFICATION
========================================== */

router.get("/webhook", (req, res) => {
  try {
    const VERIFY_TOKEN =
      process.env.META_VERIFY_TOKEN;

    const mode =
      req.query["hub.mode"];

    const token =
      req.query["hub.verify_token"];

    const challenge =
      req.query["hub.challenge"];

    console.log("📩 Webhook Verify Request");

    console.log({
      mode,
      token,
      challenge,
    });

    if (
      mode === "subscribe" &&
      token === VERIFY_TOKEN
    ) {
      console.log(
        "✅ Meta webhook verified successfully"
      );

      return res
        .status(200)
        .send(challenge);
    }

    console.error(
      "❌ Invalid verify token"
    );

    return res.sendStatus(403);
  } catch (error) {
    console.error(
      "❌ Webhook verification error:",
      error
    );

    return res.sendStatus(500);
  }
});

/* ==========================================
   RECEIVE INSTAGRAM EVENTS
========================================== */

router.post(
  "/webhook",
  async (req, res) => {
    try {
      console.log(
        "\n📩 =================================="
      );

      console.log(
        "NEW INSTAGRAM WEBHOOK EVENT"
      );

      console.log(
        "=================================="
      );

      console.log(
        JSON.stringify(
          req.body,
          null,
          2
        )
      );

      console.log(
        "==================================\n"
      );

      /* ==========================================
         TODO:
         - Detect comments
         - Match keywords
         - Send DM
         - Save leads
         - Store analytics
      ========================================== */

      return res.status(200).send("EVENT_RECEIVED");
    } catch (error) {
      console.error(
        "❌ Webhook processing error:",
        error
      );

      return res.sendStatus(500);
    }
  }
);

export default router;