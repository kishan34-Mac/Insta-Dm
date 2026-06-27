import User from "../models/User.js";
import Payment from "../models/Payment.js";
import Campaign from "../models/Campaign.js";
import Lead from "../models/Lead.js";
import { sendSuccess } from "../utils/apiResponse.js";

const getPagination = (req) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const getAdminDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalPayments,
      successfulPayments,
      totalCampaigns,
      totalLeads,
      revenueResult,
      revenueChart,
      planDistribution,
      recentUsers,
      recentPayments,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ subscriptionStatus: "active" }),
      Payment.countDocuments(),
      Payment.countDocuments({
        status: { $in: ["captured", "verified", "authorized"] },
      }),
      Campaign.countDocuments(),
      Lead.countDocuments(),
      Payment.aggregate([
        {
          $match: {
            status: { $in: ["captured", "verified", "authorized"] },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$amount" },
          },
        },
      ]),
      Payment.aggregate([
        {
          $match: {
            status: { $in: ["captured", "verified", "authorized"] },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            revenue: { $sum: "$amount" },
            payments: { $sum: 1 },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
      ]),
      User.aggregate([
        {
          $group: {
            _id: "$plan",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            plan: "$_id",
            count: 1,
          },
        },
      ]),
      User.find()
        .select("name email role plan subscriptionStatus lastLoginAt createdAt")
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      Payment.find()
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
    ]);

    return sendSuccess(res, {
      message: "Admin dashboard data fetched successfully",
      data: {
        stats: {
          totalUsers,
          activeUsers,
          totalPayments,
          successfulPayments,
          totalCampaigns,
          totalLeads,
          totalRevenue: revenueResult[0]?.totalRevenue || 0,
        },
        revenueChart,
        planDistribution,
        recentUsers,
        recentPayments,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req);

    const search = req.query.search?.trim() || "";
    const plan = req.query.plan?.trim() || "";
    const status = req.query.status?.trim() || "";

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (plan) {
      filter.plan = plan;
    }

    if (status) {
      filter.subscriptionStatus = status;
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select(
          "name email role plan subscriptionStatus billingStatus lastLoginAt instagramAccounts createdAt",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      message: "Users fetched successfully",
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminPayments = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req);

    const status = req.query.status?.trim() || "";
    const plan = req.query.plan?.trim() || "";

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (plan) {
      filter.plan = plan;
    }

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate("userId", "name email plan")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Payment.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      message: "Payments fetched successfully",
      data: {
        payments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminCampaigns = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);

    const search = req.query.search?.trim() || "";
    const status = req.query.status?.trim() || "";

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$text = {
        $search: search,
      };
    }

    const [campaigns, total] = await Promise.all([
      Campaign.find(filter)
        .populate("user", "name email plan")
        .select(
          `
          name
          description
          status
          instagramAccount
          triggerType
          triggerKeywords
          stats
          isActive
          scheduledStart
          scheduledEnd
          lastTriggeredAt
          lastMessageSentAt
          createdAt
          user
          `,
        )
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      Campaign.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      message: "Campaigns fetched successfully",
      data: {
        campaigns,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
export const updateUserPlan = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const { plan, subscriptionStatus } = req.body;

    const allowedPlans = ["free", "starter", "pro", "agency"];

    const allowedStatuses = ["free", "pending", "active", "failed"];

    if (!plan && !subscriptionStatus) {
      return res.status(400).json({
        success: false,
        message: "Provide plan or subscriptionStatus to update",
      });
    }

    if (plan && !allowedPlans.includes(plan)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan selected",
      });
    }

    if (subscriptionStatus && !allowedStatuses.includes(subscriptionStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription status",
      });
    }

    const updateData = {};

    if (plan) {
      updateData.plan = plan;

      updateData.currentBillingPlan = plan === "free" ? null : plan;
    }

    if (subscriptionStatus) {
      updateData.subscriptionStatus = subscriptionStatus;

      updateData.billingStatus = subscriptionStatus;
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("name email role plan subscriptionStatus billingStatus");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return sendSuccess(res, {
      message: "User subscription updated successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};