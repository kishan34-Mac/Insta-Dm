import mongoose from "mongoose";
import Campaign from "../models/Campaign.js";
import Lead from "../models/Lead.js";

import ExecutionLog from "../models/ExecutionLog.js";

export const getOverview = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 1. Stats Cards
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [totalCampaigns, totalLeads, activeCampaigns, pausedCampaigns, todayLeads, messagesFailed] = await Promise.all([
      Campaign.countDocuments({ user: userObjectId }),
      Lead.countDocuments({ user: userObjectId }),
      Campaign.countDocuments({ user: userObjectId, status: "active" }),
      Campaign.countDocuments({ user: userObjectId, status: "paused" }),
      Lead.countDocuments({ user: userObjectId, createdAt: { $gte: startOfToday } }),
      ExecutionLog.countDocuments({ user: userObjectId, status: "failed" }),
    ]);

    // Aggregate total messages sent across all campaigns
    const campaignStats = await Campaign.aggregate([
      { $match: { user: userObjectId } },
      {
        $group: {
          _id: null,
          totalSent: { $sum: "$stats.totalSent" },
          totalReplied: { $sum: "$stats.totalReplied" },
        },
      },
    ]);

    const totalSent = campaignStats[0]?.totalSent || 0;
    const totalReplied = campaignStats[0]?.totalReplied || 0;
    const replyRate = totalSent > 0 ? parseFloat(((totalReplied / totalSent) * 100).toFixed(1)) : 0;

    // 2. 14-day DMs and Leads growth/activity chart
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const dailyStats = await Lead.aggregate([
      {
        $match: {
          user: userObjectId,
          createdAt: { $gte: fourteenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          leads: { $sum: 1 },
          dms: { $sum: { $cond: [{ $eq: ["$dmSent", true] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Generate complete 14-day list to guarantee no empty gaps
    const dmSeries = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split("T")[0]; // YYYY-MM-DD
      const dayLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" }); // e.g. "May 10"

      const matchedDay = dailyStats.find((item) => item._id === dateString);
      dmSeries.push({
        day: dayLabel,
        dms: matchedDay ? matchedDay.dms : 0,
        leads: matchedDay ? matchedDay.leads : 0,
      });
    }

    // 3. Top Campaigns (by DMs sent)
    const campaignsList = await Campaign.find({ user: userObjectId })
      .sort({ "stats.totalSent": -1 })
      .limit(5);

    const campaignBars = campaignsList.map((c) => ({
      name: c.name,
      v: c.stats?.totalSent || 0,
    }));

    // 4. Recent Activity Feed
    const recentLeads = await Lead.find({ user: userObjectId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate("campaigns");

    const recentCampaigns = await Campaign.find({ user: userObjectId })
      .sort({ createdAt: -1 })
      .limit(3);

    const activities = [];

    // Add Lead Captured activities
    recentLeads.forEach((lead) => {
      const campaignName = lead.campaigns?.[0]?.name || "Instagram Campaign";
      
      // If they replied, show that activity as well
      if (lead.status === "replied") {
        activities.push({
          id: `reply-${lead._id}`,
          who: `@${lead.igUsername}`,
          what: `replied to your DM on campaign '${campaignName}'`,
          when: getRelativeTime(lead.updatedAt),
          timestamp: lead.updatedAt,
          type: "reply",
        });
      }

      activities.push({
        id: `lead-${lead._id}`,
        who: `@${lead.igUsername}`,
        what: `matched keyword '${lead.keyword || "keyword"}' and received DM for '${campaignName}'`,
        when: getRelativeTime(lead.createdAt),
        timestamp: lead.createdAt,
        type: "lead",
      });
    });

    // Add Campaign Created activities
    recentCampaigns.forEach((camp) => {
      activities.push({
        id: `campaign-${camp._id}`,
        who: camp.name,
        what: `campaign created with keywords [${(camp.triggerKeywords || []).join(", ")}]`,
        when: getRelativeTime(camp.createdAt),
        timestamp: camp.createdAt,
        type: "campaign",
      });
    });

    // Sort combined activities by timestamp descending and take top 6
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 6);

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalCampaigns,
          totalLeads,
          totalSent,
          replyRate,
          activeCampaigns,
          pausedCampaigns,
          todayLeads,
          messagesFailed,
        },
        charts: {
          dmSeries,
          campaignBars,
        },
        recentActivities: sortedActivities,
      },
    });
  } catch (error) {
    console.error("GET OVERVIEW ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch overview data",
    });
  }
};

// Helper function to format relative time
function getRelativeTime(date) {
  const ms = new Date() - new Date(date);
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}
