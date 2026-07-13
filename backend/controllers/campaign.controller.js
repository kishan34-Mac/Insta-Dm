import Campaign from "../models/Campaign.js";
import Lead from "../models/Lead.js";

import { sendSuccess } from "../utils/apiResponse.js";
import { AppError } from "../utils/errorHandler.js";
import APIFeatures from "../utils/apiFeatures.js";

const normalizeKeywords = (input) => {
  if (!input) return [];

  if (Array.isArray(input)) {
    return input
      .map((k) =>
        String(k || "")
          .trim()
          .toLowerCase()
      )
      .filter(Boolean);
  }

  return String(input)
    .split(",")
    .map((k) =>
      k.trim().toLowerCase()
    )
    .filter(Boolean);
};

export const createCampaign = async (
  req,
  res,
  next
) => {
  try {
    const {
      name,
      triggerType,
      triggerKeywords,
      keywords,
      postId,
      postUrl,
      steps,
      status,
      instagramAccount,
      autoReplyMessage,
    } = req.body;

    const sanitizedKeywords =
      normalizeKeywords(
        triggerKeywords || keywords
      );

    if (
      sanitizedKeywords.length === 0
    ) {
      throw new AppError(
        "At least one trigger keyword is required",
        400
      );
    }

    let finalAutoReplyMessage = autoReplyMessage;

    if (!finalAutoReplyMessage && Array.isArray(steps)) {
      const firstMessageStep = steps.find(
        (step) => step.type === "message" && step.value
      );

      if (firstMessageStep) {
        finalAutoReplyMessage = firstMessageStep.value;
      }
    }

    if (!finalAutoReplyMessage) {
      finalAutoReplyMessage = "";
    }

    if (!instagramAccount) {
      throw new AppError(
        "Instagram account is required",
        400
      );
    }

    const campaign =
      await Campaign.create({
        user:
          req.user?._id ||
          req.userId,

        name,

        triggerType:
          triggerType ||
          "comment",

        triggerKeywords:
          sanitizedKeywords,

        keywords:
          sanitizedKeywords,

        postId:
          postId || postUrl || "",

        steps: steps || [],

        status:
          status || "active",

        instagramAccount,

        autoReplyMessage: String(finalAutoReplyMessage).trim(),

        isActive: true,
      });

    console.log(
      "✅ CAMPAIGN CREATED:",
      campaign._id
    );

    return sendSuccess(res, {
      statusCode: 201,

      message:
        "Campaign created successfully",

      data: campaign,
    });
  } catch (error) {
    console.error(
      "❌ CREATE CAMPAIGN ERROR:",
      error.message
    );

    next(error);
  }
};

export const getCampaigns = async (
  req,
  res,
  next
) => {
  try {
    console.log(
      "REQ USER:",
      req.user?._id ||
        req.userId
    );

    const features = new APIFeatures(
      Campaign.find({
        user: req.user?._id || req.userId,
      }),
      req.query
    )
      .filter()
      .search(['name', 'triggerKeywords'])
      .sort()
      .paginate();

    const campaigns = await features.query;
    
    // Get total count for pagination metadata
    const totalCount = await Campaign.countDocuments({ user: req.user?._id || req.userId });

    console.log("FOUND CAMPAIGNS:", campaigns.length);

    // Optimize N+1 Query: Fetch all lead counts for these campaigns in a single aggregation
    const campaignIds = campaigns.map(c => c._id);
    const leadCounts = await Lead.aggregate([
      { $match: { campaigns: { $in: campaignIds } } },
      { $unwind: "$campaigns" },
      { $match: { campaigns: { $in: campaignIds } } },
      { $group: { _id: "$campaigns", count: { $sum: 1 } } }
    ]);

    const leadCountMap = leadCounts.reduce((acc, curr) => {
      acc[curr._id.toString()] = curr.count;
      return acc;
    }, {});

    const updatedCampaigns = campaigns.map(campaign => {
      const sentCount = leadCountMap[campaign._id.toString()] || 0;
      return {
        ...campaign.toObject(),
        sentCount,
        deliveredCount: sentCount,
        replyCount: 0,
      };
    });

    return sendSuccess(res, {
      data: {
        results: updatedCampaigns,
        total: totalCount,
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
      }
    });
  } catch (error) {
    console.error(
      "GET CAMPAIGNS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch campaigns",
    });
  }
};

export const getCampaignById =
  async (req, res, next) => {
    try {
      const campaign =
        await Campaign.findOne({
          _id: req.params.id,

          user:
            req.user?._id ||
            req.userId,
        });

      if (!campaign) {
        throw new AppError(
          "Campaign not found",
          404
        );
      }

      return sendSuccess(res, {
        data: campaign,
      });
    } catch (error) {
      next(error);
    }
  };

export const updateCampaign =
  async (req, res, next) => {
    try {
      const {
        name,
        triggerType,
        triggerKeywords,
        keywords,
        postId,
        postUrl,
        steps,
        status,
        instagramAccount,
        autoReplyMessage,
      } = req.body;

      const sanitizedKeywords =
        normalizeKeywords(
          triggerKeywords ||
            keywords
        );

      let finalAutoReplyMessage = autoReplyMessage;

      if (!finalAutoReplyMessage && Array.isArray(steps)) {
        const firstMessageStep = steps.find(
          (step) => step.type === "message" && step.value
        );

        if (firstMessageStep) {
          finalAutoReplyMessage = firstMessageStep.value;
        }
      }

      if (!finalAutoReplyMessage) {
        finalAutoReplyMessage = "";
      }

      const campaign =
        await Campaign.findOneAndUpdate(
          {
            _id: req.params.id,

            user:
              req.user?._id ||
              req.userId,
          },
          {
            name,

            triggerType,

            triggerKeywords:
              sanitizedKeywords,

            keywords:
              sanitizedKeywords,

            postId:
              postId ||
              postUrl || "",

            steps,

            status,

            instagramAccount,

            autoReplyMessage: String(finalAutoReplyMessage).trim(),
          },
          {
            returnDocument: "after",

            runValidators: true,
          }
        );

      if (!campaign) {
        throw new AppError(
          "Campaign not found",
          404
        );
      }

      return sendSuccess(res, {
        message:
          "Campaign updated successfully",

        data: campaign,
      });
    } catch (error) {
      next(error);
    }
  };

export const deleteCampaign =
  async (req, res, next) => {
    try {
      const campaign =
        await Campaign.findOneAndDelete(
          {
            _id: req.params.id,

            user:
              req.user?._id ||
              req.userId,
          }
        );

      if (!campaign) {
        throw new AppError(
          "Campaign not found",
          404
        );
      }

      return sendSuccess(res, {
        message:
          "Campaign deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

export const toggleCampaignStatus =
  async (req, res, next) => {
    try {
      const campaign =
        await Campaign.findOne({
          _id: req.params.id,

          user:
            req.user?._id ||
            req.userId,
        });

      if (!campaign) {
        throw new AppError(
          "Campaign not found",
          404
        );
      }

      campaign.status =
        campaign.status ===
        "active"
          ? "paused"
          : "active";

      await campaign.save();

      return sendSuccess(res, {
        message: `Campaign ${
          campaign.status ===
          "active"
            ? "activated"
            : "paused"
        } successfully`,

        data: campaign,
      });
    } catch (error) {
      next(error);
    }
  };

import ExecutionLog from "../models/ExecutionLog.js";

export const getCampaignLogs = async (req, res, next) => {
  try {
    const { id } = req.params;
    const logs = await ExecutionLog.find({
      campaign: id,
      user: req.user?._id || req.userId,
    })
      .sort({ createdAt: -1 })
      .limit(50);

    return sendSuccess(res, {
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};