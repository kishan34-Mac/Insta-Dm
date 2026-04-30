import mongoose from "mongoose";

/**
 * Lead Model
 * Handles leads data for DM campaigns
 */

// ============================================
// STEP 3: DATABASE MODELS - Lead
// ============================================

const LeadSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Instagram user info
    igUserId: {
      type: String,
      required: true,
    },
    igUsername: {
      type: String,
      required: true,
    },
    igFullName: {
      type: String,
      default: null,
    },
    igProfilePicture: {
      type: String,
      default: null,
    },
    // Lead source
    source: {
      type: String,
      enum: ["manual", "imported", "scraped", "campaign"],
      default: "manual",
    },
    // Lead status
    status: {
      type: String,
      enum: ["new", "contacted", "replied", "converted", "failed", "blocked"],
      default: "new",
    },
    // Notes about the lead
    notes: {
      type: String,
      default: null,
    },
    // Tags for categorization
    tags: {
      type: [
        {
          type: String,
        },
      ],
      default: [],
    },
    // Last contacted date
    lastContacted: {
      type: Date,
      default: null,
    },
    // Campaign history
    campaigns: {
      type: [
        {
          campaign: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Campaign",
          },
          contactedAt: {
            type: Date,
            default: null,
          },
          repliedAt: {
            type: Date,
            default: null,
          },
          status: {
            type: String,
            enum: ["pending", "sent", "failed", "replied"],
            default: "pending",
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

// ============================================
// STEP 3: Indexes
// ============================================

LeadSchema.index({ user: 1 });
LeadSchema.index({ igUserId: 1 });
LeadSchema.index({ status: 1 });
LeadSchema.index({ user: 1, status: 1 });
LeadSchema.index({ tags: 1 });

// Create and export Lead model
const Lead = mongoose.model("Lead", LeadSchema);

export default Lead;
