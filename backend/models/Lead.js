import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
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

    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      default: null,
    },

    source: {
      type: String,
      default: "instagram-comment",
    },

    status: {
      type: String,
      enum: ["new", "contacted", "replied", "interested", "converted", "won", "lost", "closed"],
      default: "new",
      index: true,
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

    leadScore: {
      type: Number,
      default: 10,
    },

    messagesCount: {
      type: Number,
      default: 1,
    },

    firstContact: {
      type: Date,
      default: Date.now,
    },

    lastContacted: {
      type: Date,
      default: Date.now,
      index: true,
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

// Index for fast querying by user and igUserId (non-unique to allow one Lead per campaign trigger)
leadSchema.index({ user: 1, igUserId: 1 });
leadSchema.index({ campaigns: 1 });
leadSchema.index({ user: 1, status: 1 });
leadSchema.index({ createdAt: -1 });

// Text index for search functionality
leadSchema.index({
  igUsername: "text",
  notes: "text",
  comment: "text",
});

const Lead =
  mongoose.models.Lead ||
  mongoose.model("Lead", leadSchema);

export default Lead;