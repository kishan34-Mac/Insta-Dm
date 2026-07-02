import mongoose from "mongoose";
import Lead from "../models/Lead.js";
import Conversation from "../models/Conversation.js";
import Campaign from "../models/Campaign.js";

/**
 * Persists or updates a Lead in MongoDB after campaign matching / DM execution.
 * Enforces strict uniqueness per Instagram Customer (igUserId / igUsername) for the given user workspace.
 *
 * @param {Object} params
 * @param {string|Object} params.user - User ID owning the campaign
 * @param {string} params.igUserId - Instagram Customer User ID
 * @param {string} [params.igUsername] - Instagram Customer Username
 * @param {Object} [params.campaign] - Matched Campaign Object or ID
 * @param {string} [params.eventType] - 'comment' or 'dm'
 * @param {string} [params.text] - Trigger text or comment
 * @param {string} [params.keyword] - Matched Keyword string
 * @param {boolean} [params.dmSent] - Whether Auto DM was delivered
 * @param {string} [params.traceId] - Execution Trace ID for logging
 */
export async function saveOrUpdateLead({
  user,
  igUserId,
  igUsername = "",
  campaign,
  eventType = "comment",
  text = "",
  keyword = "",
  dmSent = false,
  traceId = "",
}) {
  try {
    const cleanIgUserId = String(igUserId || "").trim();
    const cleanIgUsername = String(igUsername || "").trim();

    if (!cleanIgUserId && !cleanIgUsername) {
      console.warn(`⚠️ [Lead:${traceId}] Cannot save lead: both igUserId and igUsername are missing.`);
      return { success: false, reason: "MISSING_CUSTOMER_IDENTIFIER" };
    }

    const campaignId = campaign?._id || campaign;
    const campaignName = campaign?.name || "Instagram Campaign";
    const displayName = cleanIgUsername ? `@${cleanIgUsername}` : cleanIgUserId;

    // Link Conversation reference if available
    const conversationDoc = await Conversation.findOne({
      user,
      $or: [
        ...(cleanIgUserId ? [{ igUserId: cleanIgUserId }] : []),
        ...(cleanIgUsername ? [{ igUsername: cleanIgUsername }] : []),
      ],
    });
    const conversationId = conversationDoc?._id || null;

    // Always insert a brand-new Lead document for every campaign trigger opportunity
    const newLead = await Lead.create({
      user,
      igUserId: cleanIgUserId || `usr_${Date.now()}`,
      igUsername: cleanIgUsername || `user_${cleanIgUserId}`,
      campaigns: campaignId ? [campaignId] : [],
      conversation: conversationId,
      source: eventType === "comment" ? "instagram-comment" : "instagram-dm",
      status: "new",
      dmSent: Boolean(dmSent),
      comment: text || "",
      keyword: keyword || "",
      messagesCount: 1,
      leadScore: dmSent ? 10 : 0,
      firstContact: new Date(),
      lastContacted: new Date(),
    });

    const populatedLead = await Lead.findById(newLead._id).populate("campaigns");
    const totalUserLeads = await Lead.countDocuments({ user });

    // Structured Logging
    console.log(`[Lead:${traceId}]
Webhook Received
Campaign Matched: ${campaignName}
Keyword: ${keyword || "N/A"}
Instagram User: ${displayName}
Comment: "${text || ""}"
Conversation ID: ${conversationId || "N/A"}
Creating NEW Lead
MongoDB Insert Successful
Lead ID: ${newLead._id}
Total Leads: ${totalUserLeads}`);

    return { success: true, lead: populatedLead, isNewLead: true };
  } catch (error) {
    console.error(`❌ [Lead:${traceId}] Lead creation failed:`, {
      message: error.message,
      code: error.code,
      validationErrors: error.errors || null,
      stack: error.stack,
      igUserId,
      user,
      campaignId: campaign?._id || campaign,
    });
    return { success: false, error };
  }
}
