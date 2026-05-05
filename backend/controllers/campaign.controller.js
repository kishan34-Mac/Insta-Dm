import Campaign from "../models/Campaign.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { AppError } from "../utils/errorHandler.js";

export const createCampaign = async (req, res, next) => {
  try {
    const { name, triggerType, keywords, postId, steps, status } = req.body;

    const campaign = await Campaign.create({
      user: req.user.id,
      name,
      triggerType,
      keywords,
      postId,
      steps,
      status,
    });

    sendSuccess(res, {
      statusCode: 201,
      message: "Campaign created successfully",
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
};

export const getCampaigns = async (req, res, next) => {
  try {
    const campaigns = await Campaign.find({ user: req.user.id }).sort({ createdAt: -1 });

    sendSuccess(res, {
      data: campaigns,
    });
  } catch (error) {
    next(error);
  }
};

export const getCampaignById = async (req, res, next) => {
  try {
    const campaign = await Campaign.findOne({ _id: req.params.id, user: req.user.id });

    if (!campaign) {
      throw new AppError("Campaign not found", 404);
    }

    sendSuccess(res, {
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCampaign = async (req, res, next) => {
  try {
    const { name, triggerType, keywords, postId, steps, status } = req.body;

    const campaign = await Campaign.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { name, triggerType, keywords, postId, steps, status },
      { new: true, runValidators: true }
    );

    if (!campaign) {
      throw new AppError("Campaign not found", 404);
    }

    sendSuccess(res, {
      message: "Campaign updated successfully",
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!campaign) {
      throw new AppError("Campaign not found", 404);
    }

    sendSuccess(res, {
      message: "Campaign deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const toggleCampaignStatus = async (req, res, next) => {
  try {
    const campaign = await Campaign.findOne({ _id: req.params.id, user: req.user.id });

    if (!campaign) {
      throw new AppError("Campaign not found", 404);
    }

    campaign.status = campaign.status === "active" ? "paused" : "active";
    await campaign.save();

    sendSuccess(res, {
      message: `Campaign ${campaign.status === "active" ? "activated" : "paused"} successfully`,
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
};
