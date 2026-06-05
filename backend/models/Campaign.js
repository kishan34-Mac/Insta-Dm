import mongoose from "mongoose";

const CampaignStepSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["message", "delay", "condition"],
      required: true,
    },

    value: {
      type: String,
      default: "",
    },

    delaySeconds: {
      type: Number,
      default: 0,
    },

    order: {
      type: Number,
      required: true,
    },

    aiEnabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true,
  }
);

const CampaignStatsSchema = new mongoose.Schema(
  {
    totalTriggered: {
      type: Number,
      default: 0,
    },

    totalSent: {
      type: Number,
      default: 0,
    },

    totalDelivered: {
      type: Number,
      default: 0,
    },

    totalFailed: {
      type: Number,
      default: 0,
    },

    totalReplied: {
      type: Number,
      default: 0,
    },

    totalLeads: {
      type: Number,
      default: 0,
    },

    conversionRate: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
  }
);

const CampaignSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    instagramAccount: {
      type: String,
      required: true,
    },

    pageId: {
      type: String,
      default: "",
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    description: {
      type: String,
      default: "",
      maxlength: 500,
    },

    status: {
      type: String,
      enum: [
        "draft",
        "active",
        "paused",
        "completed",
        "stopped",
      ],
      default: "draft",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    triggerType: {
      type: String,
      enum: [
        "comment",
        "keyword",
        "direct_message",
        "story_reply",
      ],
      default: "keyword",
    },

    triggerKeywords: {
      type: [
        {
          type: String,
          trim: true,
          lowercase: true,
        },
      ],
      default: [],
      validate: {
        validator: function (v) {
          return Array.isArray(v) ? v.length > 0 : false;
        },
        message: "At least one trigger keyword is required",
      },
    },
    keywords: {
      type: [String],
      default: [],
    },

    exactMatch: {
      type: Boolean,
      default: false,
    },

    caseSensitive: {
      type: Boolean,
      default: false,
    },

    postId: {
      type: String,
      default: "",
    },

    postUrl: {
      type: String,
      default: "",
    },

    applyToAllPosts: {
      type: Boolean,
      default: true,
    },

    steps: {
      type: [CampaignStepSchema],
      default: [],
    },

    saveLeads: {
      type: Boolean,
      default: true,
    },

    tagLeads: {
      type: [String],
      default: [],
    },

    maxMessagesPerDay: {
      type: Number,
      default: 500,
    },

    randomizeDelay: {
      type: Boolean,
      default: true,
    },

    stats: {
      type: CampaignStatsSchema,
      default: () => ({}),
    },

    scheduledStart: {
      type: Date,
      default: null,
    },

    scheduledEnd: {
      type: Date,
      default: null,
    },

    timezone: {
      type: String,
      default: "UTC",
    },

    lastTriggeredAt: {
      type: Date,
      default: null,
    },

    lastMessageSentAt: {
      type: Date,
      default: null,
    },

    webhookEnabled: {
      type: Boolean,
      default: true,
    },

    autoReplyMessage: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: function (v) {
          return typeof v === "string" && v.trim().length > 0;
        },
        message: "autoReplyMessage is required",
      },
    },
  },
  {
    timestamps: true,
  }
);

CampaignSchema.index({
  user: 1,
  status: 1,
});

CampaignSchema.index({
  user: 1,
  instagramAccount: 1,
});

CampaignSchema.index({
  triggerKeywords: 1,
});

// Text index for search functionality
CampaignSchema.index({
  name: "text",
  description: "text",
});

CampaignSchema.index({
  createdAt: -1,
});

CampaignSchema.methods.incrementSent = async function () {
  this.stats.totalSent += 1;
  return this.save();
};

CampaignSchema.methods.incrementLead = async function () {
  this.stats.totalLeads += 1;
  return this.save();
};

CampaignSchema.methods.incrementReply = async function () {
  this.stats.totalReplied += 1;
  return this.save();
};

const Campaign =
  mongoose.models.Campaign ||
  mongoose.model("Campaign", CampaignSchema);

export default Campaign;