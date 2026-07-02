import mongoose from "mongoose";

const ExecutionLogSchema = new mongoose.Schema(
  {
    traceId: {
      type: String,
      required: true,
      index: true,
    },
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      default: null,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    igUserId: {
      type: String,
      default: "",
    },
    igUsername: {
      type: String,
      default: "",
    },
    eventType: {
      type: String,
      enum: ["comment", "message", "story_reply"],
      default: "comment",
    },
    keywordMatched: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["success", "failed", "retried"],
      required: true,
      index: true,
    },
    attempts: {
      type: Number,
      default: 1,
    },
    latencyMs: {
      type: Number,
      default: 0,
    },
    metaResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    error: {
      type: String,
      default: "",
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

ExecutionLogSchema.index({ user: 1, campaign: 1, createdAt: -1 });

const ExecutionLog =
  mongoose.models.ExecutionLog || mongoose.model("ExecutionLog", ExecutionLogSchema);

export default ExecutionLog;
