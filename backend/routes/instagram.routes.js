import express from "express";
import axios from "axios";

import {
  connectInstagram,
  instagramCallback,
  disconnectInstagram,
  getInstagramAccounts,
} from "../controllers/instagram.controller.js";

import { protect } from "../middleware/auth.middleware.js";

import Campaign from "../models/Campaign.js";
import InstagramAccount from "../models/instagramAccount.model.js";
import Lead from "../models/Lead.js";

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

router.delete("/disconnect/:igUserId", protect, disconnectInstagram);

router.get("/webhook", (req, res) => {
  try {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    console.log("📩 WEBHOOK VERIFY REQUEST");
    console.log("ENV TOKEN:", process.env.META_WEBHOOK_VERIFY_TOKEN);
    console.log("QUERY TOKEN:", token);

    if (
      mode === "subscribe" &&
      token === process.env.META_WEBHOOK_VERIFY_TOKEN
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
});

router.post("/webhook", async (req, res) => {
  try {
    console.log("📩 INSTAGRAM WEBHOOK RECEIVED:", JSON.stringify(req.body, null, 2));

    const entry = req.body.entry?.[0];
    if (!entry) {
      return res.status(200).send("EVENT_RECEIVED");
    }

    // ----------------------------------------------------
    // CASE A: DIRECT MESSAGING WEBHOOK (USER REPLIES BACK)
    // ----------------------------------------------------
    if (entry.messaging) {
      console.log("📩 DETECTED DIRECT MESSAGE EVENT");
      for (const messagingEvent of entry.messaging) {
        const senderId = messagingEvent.sender?.id;
        const recipientId = messagingEvent.recipient?.id;
        
        // Skip messages that are echos (sent by our own page)
        if (messagingEvent.message?.is_echo) {
          console.log("ℹ️ Echo message, ignoring.");
          continue;
        }

        const messageText = messagingEvent.message?.text || "";
        console.log(`💬 DM RECEIVED FROM ${senderId}: "${messageText}"`);

        // Find Lead associated with this Instagram sender
        const lead = await Lead.findOne({ igUserId: senderId });
        if (lead) {
          console.log(`👤 MATCHED LEAD: ${lead.igUsername} (ID: ${lead._id})`);
          
          if (lead.status !== "replied" && lead.status !== "won") {
            lead.status = "replied";
            lead.lastContacted = new Date();
            await lead.save();
            console.log(`✅ LEAD STATUS UPDATED TO 'replied'`);

            // Increment replied metrics on associated campaigns
            if (lead.campaigns && lead.campaigns.length > 0) {
              for (const campaignId of lead.campaigns) {
                const campaign = await Campaign.findById(campaignId);
                if (campaign) {
                  campaign.stats.totalReplied += 1;
                  if (campaign.stats.totalSent > 0) {
                    campaign.stats.conversionRate = Math.round(
                      (campaign.stats.totalReplied / campaign.stats.totalSent) * 100
                    );
                  }
                  await campaign.save();
                  console.log(`📈 INCREMENTED REPLIED COUNT ON CAMPAIGN: "${campaign.name}"`);
                }
              }
            }
          } else {
            console.log("ℹ️ Lead status is already replied or won, skipping stats increment.");
          }
        } else {
          console.log(`❌ NO ACTIVE LEAD FOUND IN CRM FOR SENDER ID: ${senderId}`);
        }
      }

      return res.status(200).send("EVENT_RECEIVED");
    }

    // ----------------------------------------------------
    // CASE B: COMMENTS WEBHOOK (TRIGGERS AUTOMATED DM)
    // ----------------------------------------------------
    const change = entry?.changes?.[0];
    if (!change) {
      return res.status(200).send("EVENT_RECEIVED");
    }

    console.log("📌 FIELD:", change.field);

    if (change.field !== "comments") {
      console.log("ℹ️ NOT A COMMENT EVENT, SKIPPING.");
      return res.status(200).send("EVENT_RECEIVED");
    }

    const commentData = change.value;
    const commentText = commentData?.text?.toLowerCase()?.trim();
    const commenterId = commentData?.from?.id;
    const commenterUsername = commentData?.from?.username;

    console.log(`💬 NEW COMMENT FROM @${commenterUsername}: "${commentText}"`);
    console.log(`💬 COMMENT ID: ${commentData.id}`);

    // Fetch active campaigns
    const campaigns = await campaign.find({
      status: "active",
      instagramAccount: webhookInstagramId })
    console.log(`📦 ACTIVE CAMPAIGNS FOR ACCOUNT [${webhookInstagramId}]: ${campaigns.length}`)

    // Find the campaign matching the keywords
    let commenterMatchedKeyword = "";
    const matchedCampaign = campaigns.find((campaign) => {
      const keywords = (campaign.triggerKeywords || campaign.keywords || []).map((k) =>
        String(k || "").toLowerCase().trim()
      );

      const matched = keywords.find((keyword) => commentText?.includes(keyword));
      if (matched) {
        commenterMatchedKeyword = matched;
        return true;
      }
      return false;
    });

    if (!matchedCampaign) {
      console.log("❌ NO ACTIVE CAMPAIGN MATCHED THE KEYWORDS IN THIS COMMENT.");
      return res.status(200).send("NO_CAMPAIGN_MATCHED");
    }

    console.log(`✅ MATCHED CAMPAIGN: "${matchedCampaign.name}" (ID: ${matchedCampaign._id})`);

    // Fetch corresponding Instagram account details
    const igAccount = await InstagramAccount.findOne({
      igUserId: matchedCampaign.instagramAccount,
    });

    if (!igAccount) {
      console.log(`❌ LINKED INSTAGRAM ACCOUNT [${matchedCampaign.instagramAccount}] NOT FOUND IN SYSTEM`);
      return res.status(200).send("NO_LINKED_ACCOUNT");
    }

    console.log(`✅ LINKED IG ACCOUNT VALIDATED: @${igAccount.igUsername}`);

    // Resolve DM text
    const firstMessageStep = matchedCampaign.steps?.find(
      (step) => step.type === "message"
    );

    const messageText =
      firstMessageStep?.value?.trim() ||
      matchedCampaign.autoReplyMessage?.trim() ||
      "Thanks for your comment!";

    console.log(`📤 SENDING AUTOMATED PRIVATE REPLY DM: "${messageText}"`);

    // Dispatch direct message to the commenter via Page Messaging API
    const dmResponse = await axios.post(
      `https://graph.facebook.com/v19.0/${igAccount.pageId}/messages`,
      {
        recipient: {
          comment_id: commentData.id,
        },
        message: {
          text: messageText,
        },
      },
      {
        params: {
          access_token: igAccount.accessToken,
        },
      }
    );

    console.log("✅ DM DISPATCHED SUCCESSFUL");
    console.log("📨 INSTAGRAM RESPONSE DATA:", dmResponse.data);

    // Save lead to database with robust upsert to prevent duplicate record failures
    const lead = await Lead.findOneAndUpdate(
      {
        user: matchedCampaign.user,
        igUserId: commenterId,
      },
      {
        $addToSet: { campaigns: matchedCampaign._id },
        $setOnInsert: {
          status : "new",
        },
        $set: {
          igUsername: commenterUsername,
          dmSent: true,
          source: "instagram-comment",
          comment: commentData.text,
          keyword: commenterMatchedKeyword,
          lastContacted: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    console.log("✅ LEAD INTEGRATED IN CRM:", lead);

    // Increment metrics on the matched campaign
    matchedCampaign.stats.totalSent += 1;
    matchedCampaign.stats.totalDelivered += 1;
    matchedCampaign.stats.totalLeads += 1;
    if (matchedCampaign.stats.totalSent > 0) {
      matchedCampaign.stats.conversionRate = Math.round(
        (matchedCampaign.stats.totalReplied / matchedCampaign.stats.totalSent) * 100
      );
    }
    await matchedCampaign.save();
    console.log("📈 INCREMENTED CAMPAIGN DM COUNTS");

    return res.status(200).send("EVENT_RECEIVED");
  } catch (error) {
    console.error("❌ WEBHOOK PROCESSING ERROR:");
    console.error(error.response?.data || error.message || error);
    return res.status(200).send("EVENT_HANDLED_WITH_ERRORS"); // Always respond 200 to prevent Meta from retrying and flooding
  }
});

export default router;
