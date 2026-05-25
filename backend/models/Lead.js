import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    igUserId: {
      type: String,
      required: true,
      index: true,
    },

    igUsername: {
      type: String,
      default: "",
    },

    campaigns: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Campaign",
      },
    ],

    source: {
      type: String,
      default: "instagram-comment",
    },

    status: {
      type: String,
      enum: ["new", "contacted", "replied", "won", "lost"],
      default: "new",
    },

    dmSent: {
      type: Boolean,
      default: false,
    },

    notes: {
      type: String,
      default: "",
    },

    tags: {
      type: [String],
      default: [],
    },

    lastContacted: {
      type: Date,
      default: Date.now,
    },

    comment: {
      type: String,
      default: "",
    },

    keyword: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index of lead per user/igUserId (non-unique to allow multiple interactions)
leadSchema.index({ user: 1, igUserId: 1 });

const Lead =
  mongoose.models.Lead ||
  mongoose.model("Lead", leadSchema);

export default Lead;