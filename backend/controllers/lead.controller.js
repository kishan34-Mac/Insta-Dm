import Lead from "../models/Lead.js";
import Conversation from "../models/Conversation.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { AppError } from "../utils/errorHandler.js";
import APIFeatures from "../utils/apiFeatures.js";

export const getLeads = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.userId;

    const sortOption = req.query.sort ? req.query.sort : "-updatedAt";
    const limitOption = req.query.limit ? parseInt(req.query.limit, 10) : 1000;

    const features = new APIFeatures(
      Lead.find({ user: userId }).populate("campaigns").populate("conversation"),
      { ...req.query, sort: sortOption, limit: limitOption }
    )
      .filter()
      .search(['igUsername', 'comment', 'keyword', 'notes'])
      .sort()
      .paginate();

    const rawLeads = await features.query;
    const totalCount = await Lead.countDocuments({ user: userId });

    // Single bulk lookup of Conversations for complete message history
    const igUserIds = rawLeads.map((l) => l.igUserId).filter(Boolean);
    const conversations = await Conversation.find({
      user: userId,
      igUserId: { $in: igUserIds },
    }).lean();

    const convMap = new Map(conversations.map((c) => [c.igUserId, c]));

    const results = rawLeads.map((leadObj) => {
      const plain = leadObj.toObject ? leadObj.toObject() : { ...leadObj };
      const conv = convMap.get(plain.igUserId) || plain.conversation || null;
      return {
        ...plain,
        conversation: conv,
      };
    });

    return sendSuccess(res, {
      data: {
        results,
        total: totalCount,
        page: parseInt(req.query.page, 10) || 1,
        limit: limitOption,
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getLeadById = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.userId;
    const leadObj = await Lead.findOne({ _id: req.params.id, user: userId }).populate("campaigns");

    if (!leadObj) {
      throw new AppError("Lead not found", 404);
    }

    const plain = leadObj.toObject ? leadObj.toObject() : { ...leadObj };
    const conv = await Conversation.findOne({ user: userId, igUserId: plain.igUserId }).lean();

    return sendSuccess(res, {
      data: {
        ...plain,
        conversation: conv || plain.conversation || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.userId;
    const { status, notes, tags } = req.body;

    const leadObj = await Lead.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      {
        $set: {
          ...(status && { status }),
          ...(notes !== undefined && { notes }),
          ...(tags && { tags }),
          lastContacted: new Date(),
        },
      },
      { returnDocument: "after", runValidators: true }
    ).populate("campaigns");

    if (!leadObj) {
      throw new AppError("Lead not found", 404);
    }

    const plain = leadObj.toObject ? leadObj.toObject() : { ...leadObj };
    const conv = await Conversation.findOne({ user: userId, igUserId: plain.igUserId }).lean();

    return sendSuccess(res, {
      message: "Lead updated successfully",
      data: {
        ...plain,
        conversation: conv || plain.conversation || null,
      },
    });
  } catch (error) {
    next(error);
  }
};
