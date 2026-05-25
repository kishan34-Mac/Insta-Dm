import jwt from "jsonwebtoken";
import axios from "axios";

import InstagramAccount from "../models/instagramAccount.model.js";
import Campaign from "../models/Campaign.js";
import Lead from "../models/Lead.js";
import { emitToUser } from "../services/socket.service.js";
import env from "../config/env.js";

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

export const getInstagramAccounts = async (req, res) => {
  try {
    const accounts = await InstagramAccount.find({
      user: req.userId,
      isActive: true,
    });

    return res.status(200).json({
      success: true,
      accounts,
    });
  } catch (error) {
    console.error("GET INSTAGRAM ACCOUNTS ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch Instagram accounts",
    });
  }
};

export const disconnectInstagram = async (req, res) => {
  try {
    const { igUserId } = req.params;

    await InstagramAccount.findOneAndDelete({
      igUserId,
      user: req.userId,
    });

    return res.status(200).json({
      success: true,
      message: "Instagram disconnected successfully",
    });
  } catch (error) {
    console.error("DISCONNECT INSTAGRAM ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to disconnect Instagram",
    });
  }
};

/**
 * Handle Meta/Instagram Webhook Verification (GET /webhook)
 */
export const handleWebhookVerification = async (req, res) => {
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
};

/**
 * Handle Instagram Webhook Events (POST /webhook)
 * When webhook fires: creates/updates lead, updates campaign metrics, saves messages, and emits socket updates
 */
export const handleWebhookEvent = async (req, res) => {
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
        
        // Only process actual message events, skip read receipts, deliveries, etc.
        if (!messagingEvent.message) {
          console.log("ℹ️ Non-message messaging event (e.g. read, delivery), ignoring.");
          continue;
        }

        // Skip messages that are echos (sent by our own page)
        if (messagingEvent.message?.is_echo) {
          console.log("ℹ️ Echo message, ignoring.");
          continue;
        }

        const messageText = messagingEvent.message?.text || "";
        console.log(`💬 DM RECEIVED FROM ${senderId}: "${messageText}"`);

        // Find the most recent Lead associated with this Instagram sender
        let lead = await Lead.findOne({ igUserId: senderId }).sort({ createdAt: -1 }).populate("campaigns");
        
        // Find the Instagram account that received the message
        const igAccount = await InstagramAccount.findOne({
          $or: [{ igUserId: recipientId }, { pageId: recipientId }]
        });

        if (lead) {
          console.log(`👤 MATCHED LEAD: ${lead.igUsername} (ID: ${lead._id})`);
          const userIdStr = lead.user.toString();
          
          // Customer replied to us
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
                  
                  // Emit campaign.updated realtime event
                  emitToUser(userIdStr, "campaign.updated", campaign);
                }
              }
            }

            // Emit lead.updated realtime event
            emitToUser(userIdStr, "lead.updated", lead);

            // Emit stats update triggers
            emitToUser(userIdStr, "overview.updated", { timestamp: new Date() });
            emitToUser(userIdStr, "analytics.updated", { timestamp: new Date() });
          }

          // Emit dm.replied realtime event so UI can show the incoming message
          emitToUser(userIdStr, "dm.replied", {
            lead,
            message: messageText,
            timestamp: new Date()
          });
        } else {
          console.log(`❌ NO ACTIVE LEAD FOUND IN CRM FOR SENDER ID: ${senderId}. Creating new lead.`);
          
          if (!igAccount) {
            console.log(`❌ Instagram account with ID ${recipientId} not found in system. Cannot create lead.`);
            continue;
          }

          // Fetch sender's username
          let username = "instagram_user";
          try {
            const profileRes = await axios.get(
              `https://graph.facebook.com/v19.0/${senderId}`,
              {
                params: {
                  fields: "username,name",
                  access_token: igAccount.accessToken,
                },
              }
            );
            if (profileRes.data?.username) {
              username = profileRes.data.username;
            }
          } catch (profileError) {
            console.error("Error fetching Instagram sender profile:", profileError.message);
            username = `user_${senderId}`;
          }

          // Search active campaigns for a keyword match in incoming DM
          const campaigns = await Campaign.find({
            user: igAccount.user,
            instagramAccount: igAccount.igUserId,
            status: "active"
          });
          
          let commenterMatchedKeyword = "";
          const matchedCampaign = campaigns.find((campaign) => {
            const keywords = (campaign.triggerKeywords || campaign.keywords || []).map((k) =>
              String(k || "").toLowerCase().trim()
            );

            const matched = keywords.find((keyword) => messageText.toLowerCase().includes(keyword));
            if (matched) {
              commenterMatchedKeyword = matched;
              return true;
            }
            return false;
          });

          // Save lead to database as a new separate document for each interaction
          lead = await Lead.create({
            user: igAccount.user,
            igUserId: senderId,
            campaigns: matchedCampaign ? [matchedCampaign._id] : [],
            igUsername: username,
            dmSent: true,
            status: "new",
            source: "instagram-dm",
            comment: messageText,
            keyword: commenterMatchedKeyword || "N/A",
            lastContacted: new Date(),
          });
          await lead.populate("campaigns");

          console.log("✅ LEAD INTEGRATED IN CRM:", lead);

          const userIdStr = igAccount.user.toString();

          // If matched campaign, reply automatically
          if (matchedCampaign) {
            console.log(`✅ MATCHED CAMPAIGN: "${matchedCampaign.name}" (ID: ${matchedCampaign._id})`);

            // Resolve DM text
            const firstMessageStep = matchedCampaign.steps?.find(
              (step) => step.type === "message"
            );

            const campaignMessageText =
              firstMessageStep?.value?.trim() ||
              matchedCampaign.autoReplyMessage?.trim() ||
              "Thanks for your message!";

            console.log(`📤 SENDING AUTOMATED PRIVATE REPLY DM: "${campaignMessageText}"`);

            try {
              const dmResponse = await axios.post(
                `https://graph.facebook.com/v19.0/${igAccount.pageId}/messages`,
                {
                  recipient: {
                    id: senderId,
                  },
                  message: {
                    text: campaignMessageText,
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

              // Emit dm.sent and dm.delivered for real-time interface
              emitToUser(userIdStr, "dm.sent", {
                lead,
                campaignId: matchedCampaign._id,
                message: campaignMessageText,
                timestamp: new Date()
              });

              emitToUser(userIdStr, "dm.delivered", {
                lead,
                campaignId: matchedCampaign._id,
                timestamp: new Date()
              });

              emitToUser(userIdStr, "campaign.updated", matchedCampaign);
            } catch (dmSendError) {
              console.error("❌ ERROR DISPATCHING DM:", dmSendError.response?.data || dmSendError.message);
            }
          }

          // Emit lead.created and triggers
          emitToUser(userIdStr, "lead.created", lead);
          emitToUser(userIdStr, "overview.updated", { timestamp: new Date() });
          emitToUser(userIdStr, "analytics.updated", { timestamp: new Date() });
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
    const campaigns = await Campaign.find({ status: "active" });
    console.log(`📦 ACTIVE CAMPAIGNS IN SYSTEM: ${campaigns.length}`);

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

    const isNewLead = true;

    // Save lead to database as a new separate document for each interaction
    const lead = await Lead.create({
      user: matchedCampaign.user,
      igUserId: commenterId,
      campaigns: [matchedCampaign._id],
      igUsername: commenterUsername,
      dmSent: true,
      status: "new",
      source: "instagram-comment",
      comment: commentData.text,
      keyword: commenterMatchedKeyword,
      lastContacted: new Date(),
    });
    await lead.populate("campaigns");

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

    const userIdStr = matchedCampaign.user.toString();

    // ----------------------------------------------------
    // SOCKET EMISSIONS FOR REALTIME INTERFACE GRAPHICS
    // ----------------------------------------------------
    // 1. Emit lead.created or lead.updated
    if (isNewLead) {
      emitToUser(userIdStr, "lead.created", lead);
    } else {
      emitToUser(userIdStr, "lead.updated", lead);
    }

    // 2. Emit dm.sent and dm.delivered
    emitToUser(userIdStr, "dm.sent", {
      lead,
      campaignId: matchedCampaign._id,
      message: messageText,
      timestamp: new Date()
    });

    emitToUser(userIdStr, "dm.delivered", {
      lead,
      campaignId: matchedCampaign._id,
      timestamp: new Date()
    });

    // 3. Emit campaign.updated
    emitToUser(userIdStr, "campaign.updated", matchedCampaign);

    // 4. Emit overview.updated and analytics.updated
    emitToUser(userIdStr, "overview.updated", { timestamp: new Date() });
    emitToUser(userIdStr, "analytics.updated", { timestamp: new Date() });

    return res.status(200).send("EVENT_RECEIVED");
  } catch (error) {
    console.error("❌ WEBHOOK PROCESSING ERROR:");
    console.error(error.response?.data || error.message || error);
    return res.status(200).send("EVENT_HANDLED_WITH_ERRORS"); // Always respond 200 to prevent Meta from retrying
  }
};