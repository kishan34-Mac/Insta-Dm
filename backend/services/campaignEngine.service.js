import crypto from "crypto";
import axios from "axios";
import User from "../models/User.js";
import Campaign from "../models/Campaign.js";
import Lead from "../models/Lead.js";
import Conversation from "../models/Conversation.js";
import InstagramAccount from "../models/instagramAccount.model.js";
import WebhookLog from "../models/WebhookLog.js";
import ExecutionLog from "../models/ExecutionLog.js";
import { matchKeyword } from "./keyword.service.js";
import { sendAutoDM } from "./meta.service.js";
import { emitToUser } from "./socket.service.js";
import { saveOrUpdateLead } from "./lead.service.js";

/**
 * Helper to find or restore an active Instagram account across models
 */
async function findActiveInstagramAccount(recipientId, eventData = {}) {
  const cleanRecipientId = String(recipientId || "").trim();
  const cleanIgAccountId = String(eventData.igAccountId || "").trim();

  // 1. Check InstagramAccount standalone collection
  let igAccount = await InstagramAccount.findOne({
    $or: [
      { igUserId: cleanRecipientId },
      { pageId: cleanRecipientId },
      { igUserId: cleanIgAccountId },
    ],
  });

  if (igAccount) return igAccount;

  // 2. Check User.instagramAccounts embedded array
  const userDoc = await User.findOne({
    $or: [
      { "instagramAccounts.igUserId": cleanRecipientId },
      { "instagramAccounts.pageId": cleanRecipientId },
      { "instagramAccounts.igUserId": cleanIgAccountId },
    ],
  }).select("+instagramAccounts.accessToken");

  if (userDoc && userDoc.instagramAccounts?.length > 0) {
    const matched = userDoc.instagramAccounts.find(
      (a) => a.igUserId === cleanRecipientId || a.pageId === cleanRecipientId || a.igUserId === cleanIgAccountId
    ) || userDoc.instagramAccounts[0];

    if (matched) {
      igAccount = await InstagramAccount.findOneAndUpdate(
        { igUserId: matched.igUserId },
        {
          user: userDoc._id,
          igUserId: matched.igUserId,
          igUsername: matched.igUsername || "instagram_user",
          pageId: matched.pageId,
          pageName: matched.pageName || "",
          accessToken: matched.accessToken,
          connectedAt: matched.connectedAt || new Date(),
          isActive: true,
        },
        { upsert: true, returnDocument: "after" }
      );
      return igAccount;
    }
  }

  // 3. Fallback: retrieve the single most recently connected account
  igAccount = await InstagramAccount.findOne({}).sort({ updatedAt: -1 });
  if (igAccount) return igAccount;

  const fallbackUser = await User.findOne({ "instagramAccounts.0": { $exists: true } }).select("+instagramAccounts.accessToken");
  if (fallbackUser && fallbackUser.instagramAccounts?.[0]) {
    const acc = fallbackUser.instagramAccounts[0];
    igAccount = await InstagramAccount.findOneAndUpdate(
      { igUserId: acc.igUserId },
      {
        user: fallbackUser._id,
        igUserId: acc.igUserId,
        igUsername: acc.igUsername || "instagram_user",
        pageId: acc.pageId,
        pageName: acc.pageName || "",
        accessToken: acc.accessToken,
        connectedAt: new Date(),
        isActive: true,
      },
      { upsert: true, returnDocument: "after" }
    );
    return igAccount;
  }

  return null;
}

/**
 * Main Campaign Engine Orchestrator
 */
export const processWebhookEvent = async (eventData) => {
  const traceId = crypto.randomBytes(8).toString("hex");
  console.log(`🚀 [CampaignEngine:${traceId}] Started processing webhook event`);

  try {
    const { eventId, eventType, senderId, recipientId, text, commentId } = eventData;

    // -----------------------------------------------------------------
    // 1. DEDUPLICATION (IDEMPOTENCY CHECK)
    // -----------------------------------------------------------------
    let webhookLog;
    try {
      webhookLog = await WebhookLog.create({
        eventId,
        eventType,
        senderId,
        recipientId,
        payload: eventData,
        status: "received",
      });
    } catch (dbErr) {
      if (dbErr.code === 11000) {
        console.log(`ℹ️ [CampaignEngine:${traceId}] Event '${eventId}' is a duplicate. Ignoring.`);
        return { duplicate: true };
      }
      throw dbErr;
    }

    // -----------------------------------------------------------------
    // 2. FIND LINKED INSTAGRAM ACCOUNT
    // -----------------------------------------------------------------
    const igAccount = await findActiveInstagramAccount(recipientId, eventData);

    if (!igAccount) {
      console.warn(`⚠️ [CampaignEngine:${traceId}] Active Instagram account for recipientId '${recipientId}' not found in system.`);
      webhookLog.status = "failed";
      webhookLog.errorMessage = "Instagram account not found or inactive";
      await webhookLog.save();
      return { success: false, reason: "ACCOUNT_NOT_FOUND" };
    }

    const userIdStr = igAccount.user.toString();

    // -----------------------------------------------------------------
    // 3. FETCH & FILTER ACTIVE CAMPAIGNS ONLY
    // -----------------------------------------------------------------
    const now = new Date();
    const activeCampaigns = await Campaign.find({
      user: igAccount.user,
      instagramAccount: igAccount.igUserId,
      status: "active",
      $and: [
        { $or: [{ scheduledStart: null }, { scheduledStart: { $lte: now } }] },
        { $or: [{ scheduledEnd: null }, { scheduledEnd: { $gte: now } }] },
      ],
    });

    console.log(`📦 [CampaignEngine:${traceId}] Active campaigns for user ${userIdStr}: ${activeCampaigns.length}`);

    if (activeCampaigns.length === 0) {
      webhookLog.status = "processed";
      await webhookLog.save();
      return { success: true, reason: "NO_ACTIVE_CAMPAIGNS" };
    }

    // -----------------------------------------------------------------
    // 4. KEYWORD MATCHING
    // -----------------------------------------------------------------
    let matchedCampaign = null;
    let matchedKeywordName = "";

    for (const campaign of activeCampaigns) {
      const keywords = campaign.triggerKeywords || campaign.keywords || [];
      const matchResult = matchKeyword(text, keywords, {
        matchType: campaign.matchType || "contains",
        exactMatch: campaign.exactMatch || false,
        caseSensitive: campaign.caseSensitive || false,
      });

      if (matchResult.isMatch) {
        matchedCampaign = campaign;
        matchedKeywordName = matchResult.matchedKeyword;
        break;
      }
    }

    // Handle User Direct Message Reply (Update existing conversation & lead status)
    if (eventType === "message" && eventData.isEcho !== true) {
      await handleInboundMessage({
        userId: igAccount.user,
        igAccount,
        senderId,
        text,
        matchedCampaign,
        traceId,
      });
    }

    if (!matchedCampaign) {
      console.log(`ℹ️ [CampaignEngine:${traceId}] Text "${text}" did not match any keywords in active campaigns.`);
      webhookLog.status = "processed";
      await webhookLog.save();
      return { success: true, reason: "NO_KEYWORD_MATCH" };
    }

    console.log(`🎯 [CampaignEngine:${traceId}] Matched Campaign: "${matchedCampaign.name}" on keyword "${matchedKeywordName}"`);

    // Increment Trigger Stats
    matchedCampaign.stats.totalTriggered = (matchedCampaign.stats.totalTriggered || 0) + 1;
    matchedCampaign.lastTriggeredAt = new Date();
    await matchedCampaign.save();

    // -----------------------------------------------------------------
    // 5. RESOLVE AUTOMATED DM RESPONSE TEXT
    // -----------------------------------------------------------------
    const firstMessageStep = matchedCampaign.steps?.find((s) => s.type === "message" && s.value?.trim());
    const dmMessageText =
      firstMessageStep?.value?.trim() ||
      matchedCampaign.autoReplyMessage?.trim() ||
      "Thanks for reaching out! Here is your requested information.";

    // -----------------------------------------------------------------
    // 6. DISPATCH DM VIA META SERVICE (WITH RETRIES)
    // -----------------------------------------------------------------
    const dmResult = await sendAutoDM({
      pageId: igAccount.pageId,
      accessToken: igAccount.accessToken,
      commentId: commentId || null,
      recipientId: senderId || null,
      messageText: dmMessageText,
      maxRetries: 3,
    });

    // -----------------------------------------------------------------
    // 7. FETCH SENDER PROFILE (USERNAME)
    // -----------------------------------------------------------------
    let senderUsername = eventData.senderUsername || `user_${senderId}`;
    if (!eventData.senderUsername && senderId) {
      try {
        const profileRes = await axios.get(`https://graph.facebook.com/v19.0/${senderId}`, {
          params: { fields: "username,name", access_token: igAccount.accessToken },
          timeout: 5000,
        });
        if (profileRes.data?.username) {
          senderUsername = profileRes.data.username;
        }
      } catch (err) {
        // Fallback username
      }
    }

    // -----------------------------------------------------------------
    // 8. CONVERSATION MANAGEMENT & MESSAGE LOGGING
    // -----------------------------------------------------------------
    let conversation = await Conversation.findOne({ user: igAccount.user, igUserId: senderId });

    if (!conversation) {
      conversation = new Conversation({
        user: igAccount.user,
        igAccount: igAccount.igUserId,
        igUserId: senderId,
        igUsername: senderUsername,
        campaign: matchedCampaign._id,
        status: "open",
        platform: "instagram",
        messages: [],
      });
    }

    // Append Inbound Message/Comment
    conversation.messages.push({
      messageId: commentId || `in_${Date.now()}`,
      senderId,
      recipientId: igAccount.igUserId,
      direction: "inbound",
      text,
      status: "delivered",
      timestamp: new Date(),
    });

    // Append Outbound Auto DM
    if (dmResult.success) {
      conversation.messages.push({
        messageId: dmResult.data?.message_id || `out_${Date.now()}`,
        senderId: igAccount.igUserId,
        recipientId: senderId,
        direction: "outbound",
        text: dmMessageText,
        status: "delivered",
        timestamp: new Date(),
      });
      conversation.lastMessage = dmMessageText;
      conversation.lastMessageAt = new Date();
    }
    await conversation.save();

    // -----------------------------------------------------------------
    // 9. ATOMIC LEAD CRM MANAGEMENT (UPSERT ON USER + IGUSERID)
    // -----------------------------------------------------------------
    let lead = null;
    let isNewLead = false;

    const isSelfAccount =
      senderId === igAccount.igUserId ||
      senderId === igAccount.pageId ||
      (senderUsername && senderUsername === igAccount.igUsername);

    if (isSelfAccount) {
      console.log(`ℹ️ [CampaignEngine:${traceId}] Event sender is self-account (@${senderUsername}). Skipping self-lead creation.`);
    } else {
      const leadRes = await saveOrUpdateLead({
        user: igAccount.user,
        igUserId: senderId,
        igUsername: senderUsername,
        campaign: matchedCampaign,
        eventType,
        text,
        keyword: matchedKeywordName,
        dmSent: dmResult.success,
        traceId,
      });

      if (leadRes.success) {
        lead = leadRes.lead;
        isNewLead = leadRes.isNewLead;
      }
    }

    // -----------------------------------------------------------------
    // 10. UPDATE CAMPAIGN STATS METRICS
    // -----------------------------------------------------------------
    if (dmResult.success) {
      matchedCampaign.stats.totalSent = (matchedCampaign.stats.totalSent || 0) + 1;
      matchedCampaign.stats.totalDelivered = (matchedCampaign.stats.totalDelivered || 0) + 1;
      if (!isSelfAccount) {
        matchedCampaign.stats.totalLeads = (matchedCampaign.stats.totalLeads || 0) + (isNewLead ? 1 : 0);
      }
      matchedCampaign.lastMessageSentAt = new Date();
    } else {
      matchedCampaign.stats.totalFailed = (matchedCampaign.stats.totalFailed || 0) + 1;
    }

    if (matchedCampaign.stats.totalSent > 0) {
      matchedCampaign.stats.conversionRate = Math.round(
        ((matchedCampaign.stats.totalReplied || 0) / matchedCampaign.stats.totalSent) * 100
      );
    }
    await matchedCampaign.save();

    // -----------------------------------------------------------------
    // 11. RECORD EXECUTION LOG & UPDATE WEBHOOK LOG
    // -----------------------------------------------------------------
    await ExecutionLog.create({
      traceId,
      campaign: matchedCampaign._id,
      user: igAccount.user,
      igUserId: senderId,
      igUsername: senderUsername,
      eventType,
      keywordMatched: matchedKeywordName,
      status: dmResult.success ? "success" : "failed",
      attempts: dmResult.attempts,
      latencyMs: dmResult.latencyMs,
      metaResponse: dmResult.data || null,
      error: dmResult.error || "",
      timestamp: new Date(),
    });

    webhookLog.status = dmResult.success ? "processed" : "failed";
    webhookLog.errorMessage = dmResult.error || "";
    webhookLog.processedAt = new Date();
    await webhookLog.save();

    // -----------------------------------------------------------------
    // 12. EMIT REALTIME SOCKET.IO EVENTS
    // -----------------------------------------------------------------
    if (lead) {
      if (isNewLead) {
        emitToUser(userIdStr, "lead.created", lead);
      } else {
        emitToUser(userIdStr, "lead.updated", lead);
      }
    }

    if (dmResult.success) {
      emitToUser(userIdStr, "dm.sent", {
        lead,
        campaignId: matchedCampaign._id,
        message: dmMessageText,
        timestamp: new Date(),
      });
      emitToUser(userIdStr, "dm.delivered", {
        lead,
        campaignId: matchedCampaign._id,
        timestamp: new Date(),
      });
    }

    emitToUser(userIdStr, "conversation.updated", conversation);
    emitToUser(userIdStr, "campaign.updated", matchedCampaign);
    emitToUser(userIdStr, "overview.updated", { timestamp: new Date() });
    emitToUser(userIdStr, "analytics.updated", { timestamp: new Date() });

    console.log(`🎉 [CampaignEngine:${traceId}] Execution completed successfully.`);

    return { success: true, dmResult, lead };
  } catch (error) {
    console.error(`❌ [CampaignEngine:${traceId}] Error during execution:`, error);
    throw error;
  }
};

/**
 * Helper to update lead status & replied stats when customer replies in DM
 */
async function handleInboundMessage({ userId, igAccount, senderId, text, matchedCampaign, traceId }) {
  try {
    const lead = await Lead.findOne({ user: userId, igUserId: senderId });
    if (lead) {
      if (lead.status !== "replied" && lead.status !== "won" && lead.status !== "converted") {
        lead.status = "replied";
        lead.lastContacted = new Date();
        lead.leadScore = (lead.leadScore || 10) + 5;
        await lead.save();

        const userIdStr = userId.toString();

        if (lead.campaigns && lead.campaigns.length > 0) {
          for (const campaignId of lead.campaigns) {
            const campaign = await Campaign.findById(campaignId);
            if (campaign) {
              campaign.stats.totalReplied = (campaign.stats.totalReplied || 0) + 1;
              if (campaign.stats.totalSent > 0) {
                campaign.stats.conversionRate = Math.round(
                  (campaign.stats.totalReplied / campaign.stats.totalSent) * 100
                );
              }
              await campaign.save();
              emitToUser(userIdStr, "campaign.updated", campaign);
            }
          }
        }

        emitToUser(userIdStr, "lead.updated", lead);
        emitToUser(userIdStr, "dm.replied", {
          lead,
          message: text,
          timestamp: new Date(),
        });
      }
    }
  } catch (err) {
    console.error(`❌ [CampaignEngine:${traceId}] Error handling inbound reply:`, err.message);
  }
}
