import express from "express";
import axios from "axios";

import {
  connectInstagram,
  instagramCallback,
  disconnectInstagram,
  getInstagramAccounts,
  handleWebhookVerification,
  handleWebhookEvent,
} from "../controllers/instagram.controller.js";

import { protect } from "../middleware/auth.middleware.js";

import Campaign from "../models/Campaign.js";
import InstagramAccount from "../models/instagramAccount.model.js";
import Lead from "../models/Lead.js";

import { validate } from "../validators/auth.validator.js";
import { disconnectInstagramSchema, webhookVerificationSchema } from "../validators/instagram.validator.js";

const router = express.Router();

router.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Instagram routes working 🚀",
  });
});

router.get("/connect", protect, connectInstagram);

router.get("/callback", instagramCallback);

router.get("/accounts", protect, getInstagramAccounts);

router.delete("/disconnect/:igUserId", protect, validate(disconnectInstagramSchema), disconnectInstagram);

router.get("/webhook", validate(webhookVerificationSchema), handleWebhookVerification);

router.post("/webhook", handleWebhookEvent);

export default router;