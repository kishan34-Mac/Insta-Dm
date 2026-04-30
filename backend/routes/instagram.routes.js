import express from "express";
import {
  connectInstagram,
  instagramCallback,
  disconnectInstagram,
  getInstagramAccounts,
} from "../controllers/instagram.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

/**
 * Instagram Routes
 * Handles Instagram OAuth and account management
 */

//

const router = express.Router();

// @route   GET /auth/instagram/connect
// @desc    Redirect to Instagram OAuth
// @access  Private
router.get("/connect", protect, connectInstagram);

// @route   GET /auth/instagram/callback
// @desc    Handle Instagram OAuth callback
// @access  Public (called by Meta redirect)
router.get("/callback", instagramCallback);

// @route   GET /auth/instagram/accounts
// @desc    Get connected Instagram accounts
// @access  Private
router.get("/accounts", protect, getInstagramAccounts);

// @route   POST /auth/instagram/disconnect
// @desc    Disconnect Instagram account
// @access  Private
router.post("/disconnect", protect, disconnectInstagram);

export default router;
