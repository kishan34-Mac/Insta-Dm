import mongoose from "mongoose";

const WebhookLogSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: ["comment", "message", "story_reply"],
      required: true,
    },
    senderId: {
      type: String,
      default: "",
    },
    recipientId: {
      type: String,
      default: "",
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ["received", "processed", "duplicate", "failed"],
      default: "received",
      index: true,
    },
    errorMessage: {
      type: String,
      default: "",
    },
    processedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for TTL or cleanup after 30 days
WebhookLogSchema.index({ createdAt: -1 });

const WebhookLog =
  mongoose.models.WebhookLog || mongoose.model("WebhookLog", WebhookLogSchema);

export default WebhookLog;
