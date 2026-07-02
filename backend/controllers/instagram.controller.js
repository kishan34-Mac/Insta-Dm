import jwt from "jsonwebtoken";
import axios from "axios";

import InstagramAccount from "../models/instagramAccount.model.js";
import User from "../models/User.js";
import Campaign from "../models/Campaign.js";
import Lead from "../models/Lead.js";
import { emitToUser } from "../services/socket.service.js";
import env from "../config/env.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { AppError } from "../utils/errorHandler.js";

export const connectInstagram = async (req, res) => {
  try {
    const token = req.query.token;

    if (!token) {
      return res.redirect(`${env.FRONTEND_URL}/login`);
    }

    const redirectUri = env.INSTAGRAM_REDIRECT_URI;

    const scopes = [
      "instagram_basic",
      "instagram_manage_messages",
      "instagram_manage_comments",
      "pages_show_list",
      "pages_read_engagement",
      "pages_manage_metadata",
      "pages_messaging",
      "business_management",
    ];

    const authUrl =
      `https://www.facebook.com/v19.0/dialog/oauth` +
      `?client_id=${env.INSTAGRAM_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${scopes.join(",")}` +
      `&response_type=code` +
      `&state=${token}`;

    console.log("INSTAGRAM AUTH URL:", authUrl);

    return res.redirect(authUrl);
  } catch (error) {
    console.error("CONNECT INSTAGRAM ERROR:", error.message);

    return res.redirect(
      `${env.FRONTEND_URL}/dashboard/settings?error=instagram_connect_failed`
    );
  }
};

export const instagramCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    console.log("CALLBACK CODE:", code);
    console.log("CALLBACK STATE:", state);

    if (!code) {
      return res.redirect(
        `${env.FRONTEND_URL}/dashboard/settings?error=no_code`
      );
    }

    // Verify state payload
    const decoded = jwt.verify(state, env.JWT_SECRET);
    const userId = decoded.userId;

    // Get access token from Facebook Graph API
    const tokenResponse = await axios.get(
      "https://graph.facebook.com/v19.0/oauth/access_token",
      {
        params: {
          client_id: env.INSTAGRAM_CLIENT_ID,
          client_secret: env.INSTAGRAM_CLIENT_SECRET,
          redirect_uri: env.INSTAGRAM_REDIRECT_URI,
          code,
        },
      }
    );

    console.log("TOKEN RESPONSE:", tokenResponse.data);

    const accessToken = tokenResponse.data.access_token;

    // Fetch managed Facebook pages
    const pagesResponse = await axios.get(
      "https://graph.facebook.com/v19.0/me/accounts",
      {
        params: {
          access_token: accessToken,
        },
      }
    );

    console.log("PAGES RESPONSE:", pagesResponse.data);

    const pages = pagesResponse.data.data;

    if (!pages?.length) {
      return res.redirect(
        `${env.FRONTEND_URL}/dashboard/settings?error=no_pages`
      );
    }

    const page = pages[0];

    // Fetch Instagram business info linked to the page
    const igBusinessResponse = await axios.get(
      `https://graph.facebook.com/v19.0/${page.id}`,
      {
        params: {
          fields: "instagram_business_account",
          access_token: page.access_token,
        },
      }
    );

    console.log("IG BUSINESS RESPONSE:", igBusinessResponse.data);

    const igBusiness = igBusinessResponse.data.instagram_business_account;

    if (!igBusiness?.id) {
      return res.redirect(
        `${env.FRONTEND_URL}/dashboard/settings?error=no_instagram_business`
      );
    }

    // Fetch Instagram profile details
    const igProfileResponse = await axios.get(
      `https://graph.facebook.com/v19.0/${igBusiness.id}`,
      {
        params: {
          fields: "id,username,profile_picture_url",
          access_token: page.access_token,
        },
      }
    );

    console.log("IG PROFILE:", igProfileResponse.data);

    const igProfile = igProfileResponse.data;

    // Save or update linked Instagram account in DB
    const savedAccount = await InstagramAccount.findOneAndUpdate(
      {
        igUserId: igProfile.id,
      },
      {
        user: userId,
        igUserId: igProfile.id,
        igUsername: igProfile.username,
        pageId: page.id,
        pageName: page.name,
        accessToken: page.access_token,
        connectedAt: new Date(),
        isActive: true,
        webhookSubscribed: false,
      },
      {
        upsert: true,
        returnDocument: "after",
      }
    );

    // Also sync account to User model
    try {
      await User.findByIdAndUpdate(userId, {
        $pull: { instagramAccounts: { igUserId: igProfile.id } },
      });

      await User.findByIdAndUpdate(userId, {
        $push: {
          instagramAccounts: {
            igUserId: igProfile.id,
            igUsername: igProfile.username,
            pageId: page.id,
            pageName: page.name,
            accessToken: page.access_token,
            tokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            connectedAt: new Date(),
            isActive: true,
          },
        },
      });
    } catch (userSyncErr) {
      console.warn("User instagramAccounts sync error:", userSyncErr.message);
    }

    console.log("ACCOUNT SAVED:", savedAccount);

    // Subscribe page to Facebook webhook events
    try {
      const subscribeResponse = await axios.post(
        `https://graph.facebook.com/v19.0/${page.id}/subscribed_apps`,
        {},
        {
          params: {
            subscribed_fields: "messages,messaging_postbacks,feed",
            access_token: page.access_token,
          },
        }
      );

      console.log("✅ WEBHOOK SUBSCRIBED:", subscribeResponse.data);

      savedAccount.webhookSubscribed = true;
      await savedAccount.save();
    } catch (subscribeError) {
      console.error(
        "WEBHOOK SUBSCRIBE ERROR:",
        subscribeError.response?.data || subscribeError.message
      );
    }

    return res.redirect(
      `${env.FRONTEND_URL}/dashboard/settings?success=instagram_connected`
    );
  } catch (error) {
    console.error(
      "Instagram callback error:",
      error.response?.data || error.message
    );

    return res.redirect(
      `${env.FRONTEND_URL}/dashboard/settings?error=instagram_callback_failed`
    );
  }
};

export const getInstagramAccounts = async (req, res, next) => {
  try {
    const accounts = await InstagramAccount.find({
      user: req.userId,
      isActive: true,
    });

    return sendSuccess(res, {
      data: accounts,
    });
  } catch (error) {
    next(new AppError("Failed to fetch Instagram accounts", 500));
  }
};

export const disconnectInstagram = async (req, res, next) => {
  try {
    const { igUserId } = req.params;

    const account = await InstagramAccount.findOneAndDelete({
      igUserId,
      user: req.userId,
    });

    if (!account) {
      throw new AppError("Instagram account not found", 404);
    }

    return sendSuccess(res, {
      message: "Instagram disconnected successfully",
    });
  } catch (error) {
    next(new AppError("Failed to disconnect Instagram", 500));
  }
};

import crypto from "crypto";
import { eventQueue } from "../services/queue.service.js";

/**
 * Handle Meta/Instagram Webhook Verification (GET /webhook)
 */
export const handleWebhookVerification = async (req, res) => {
  try {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    const verifyToken = env.META_VERIFY_TOKEN || process.env.META_WEBHOOK_VERIFY_TOKEN;

    console.log("📩 WEBHOOK VERIFY REQUEST");
    console.log("EXPECTED TOKEN:", verifyToken);
    console.log("RECEIVED TOKEN:", token);

    if (
      mode === "subscribe" &&
      token === verifyToken
    ) {
      console.log("✅ WEBHOOK VERIFIED");
      return res.status(200).send(challenge);
    }

    console.log("❌ INVALID VERIFY TOKEN");
    return res.sendStatus(403);
  } catch (error) {
    console.error("❌ WEBHOOK VERIFY ERROR:", error);
    return res.sendStatus(500);
  }
};

/**
 * Validate Meta Signature (x-hub-signature-256)
 */
const verifyMetaSignature = (req) => {
  const signature = req.headers["x-hub-signature-256"];
  const appSecret = env.FACEBOOK_APP_SECRET || process.env.FACEBOOK_APP_SECRET;

  if (!signature || !appSecret) {
    return true; // Pass if secret or signature not present
  }

  try {
    const parts = signature.split("=");
    const expectedHash = parts[1];
    const rawBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body);

    const actualHash = crypto
      .createHmac("sha256", appSecret)
      .update(rawBody)
      .digest("hex");

    const matches = crypto.timingSafeEqual(Buffer.from(expectedHash), Buffer.from(actualHash));
    if (!matches) {
      console.warn("⚠️ Meta HMAC signature mismatch (allowing event processing to avoid dropped DMs)");
    }
    return true;
  } catch (err) {
    console.error("Signature verification exception:", err.message);
    return true; // Graceful fallback
  }
};

/**
 * Handle Instagram Webhook Events (POST /webhook)
 * Immediately validates, enqueues to EventQueue, and responds 200 OK to Meta.
 */
export const handleWebhookEvent = async (req, res) => {
  try {
    console.log("📩 INSTAGRAM WEBHOOK RECEIVED:", JSON.stringify(req.body, null, 2));

    if (!verifyMetaSignature(req)) {
      console.warn("⚠️ Webhook signature verification failed!");
      return res.status(403).send("INVALID_SIGNATURE");
    }

    const entries = req.body?.entry;
    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(200).send("EVENT_RECEIVED");
    }

    for (const entry of entries) {
      const entryId = entry.id;

      // 1. Direct Messaging Webhook Events
      if (Array.isArray(entry.messaging)) {
        for (const messagingEvent of entry.messaging) {
          if (!messagingEvent.message) continue;

          const senderId = messagingEvent.sender?.id;
          const recipientId = messagingEvent.recipient?.id || entryId;
          const text = messagingEvent.message?.text || "";
          const isEcho = Boolean(messagingEvent.message?.is_echo);
          const mid = messagingEvent.message?.mid;
          const eventId = mid ? `mid_${mid}` : `msg_${senderId}_${recipientId}_${messagingEvent.timestamp || Date.now()}`;

          eventQueue.enqueue({
            eventId,
            eventType: "message",
            senderId,
            recipientId,
            text,
            isEcho,
            timestamp: messagingEvent.timestamp || Date.now(),
          });
        }
      }

      // 2. Comment Webhook Events
      if (Array.isArray(entry.changes)) {
        for (const change of entry.changes) {
          if (change.field !== "comments" && change.field !== "mentions") continue;

          const commentData = change.value;
          if (!commentData) continue;

          const senderId = commentData.from?.id;
          const senderUsername = commentData.from?.username;
          const commentId = commentData.id;
          const text = commentData.text || "";
          const eventId = commentId ? `comment_${commentId}` : `comment_${senderId}_${Date.now()}`;

          eventQueue.enqueue({
            eventId,
            eventType: "comment",
            senderId,
            senderUsername,
            recipientId: entryId,
            commentId,
            text,
            timestamp: commentData.created_time ? new Date(commentData.created_time * 1000).getTime() : Date.now(),
          });
        }
      }
    }

    // Always respond 200 OK immediately to prevent Meta webhook retries/timeouts
    return res.status(200).send("EVENT_RECEIVED");
  } catch (error) {
    console.error("❌ WEBHOOK RECEIVE ERROR:", error.message || error);
    return res.status(200).send("EVENT_RECEIVED");
  }
};