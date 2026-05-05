import mongoose from "mongoose";

const CampaignSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    instagramAccount: {
      type: String, // Store IG user ID
      required: false,
    },
    status: {
      type: String,
      enum: ["draft", "active", "paused", "completed", "stopped"],
      default: "draft",
    },
    // Trigger settings
    triggerType: {
      type: String,
      enum: ["comment", "keyword", "direct_message"],
      default: "keyword",
    },
    keywords: {
      type: [String],
      default: [],
    },
    postId: {
      type: String, // Specific post or empty for all
      default: "",
    },
    // Message templates (steps)
    steps: [
      {
        type: {
          type: String,
          enum: ["message", "delay"],
          required: true,
        },
        value: {
          type: String,
          required: true,
        },
      },
    ],
    // Campaign stats
    stats: {
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
    },
    // Scheduled start time
    scheduledStart: {
      type: Date,
      default: null,
    },
    // Scheduled end time
    scheduledEnd: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// ============================================
// STEP 3: Indexes
// ============================================

CampaignSchema.index({ user: 1 });
CampaignSchema.index({ status: 1 });
CampaignSchema.index({ user: 1, status: 1 });

// Create and export Campaign model
const Campaign = mongoose.model("Campaign", CampaignSchema);

export default Campaign;
