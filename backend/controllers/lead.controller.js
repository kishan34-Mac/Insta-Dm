import Lead from "../models/Lead.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { AppError } from "../utils/errorHandler.js";
import APIFeatures from "../utils/apiFeatures.js";

export const getLeads = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.userId;

    const features = new APIFeatures(
      Lead.find({ user: userId }).populate("campaigns"),
      req.query
    )
      .filter()
      .search(['username', 'fullName', 'notes'])
      .sort()
      .paginate();

    const leads = await features.query;
    const totalCount = await Lead.countDocuments({ user: userId });

    return sendSuccess(res, {
      data: {
        results: leads,
        total: totalCount,
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.userId;
    const { status, notes, tags } = req.body;

    const lead = await Lead.findOneAndUpdate(
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

    if (!lead) {
      throw new AppError("Lead not found", 404);
    }

    return sendSuccess(res, {
      message: "Lead updated successfully",
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};
