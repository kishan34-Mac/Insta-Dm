import mongoose from "mongoose";

const MessageItemSchema = new mongoose.Schema(
  {
    messageId: {
      type: String,
      default: "",
    },
    senderId: {
      type: String,
      required: true,
    },
    recipientId: {
      type: String,
      required: true,
    },
    direction: {
      type: String,
      enum: ["inbound", "outbound"],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "failed", "read"],
      default: "sent",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);

const ConversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    igAccount: {
      type: String,
      default: "",
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
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      default: null,
    },
    lastMessage: {
      type: String,
      default: "",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["open", "archived", "closed"],
      default: "open",
    },
    platform: {
      type: String,
      default: "instagram",
    },
    messages: [MessageItemSchema],
  },
  {
    timestamps: true,
  }
);

// Ensure single conversation record per user and customer igUserId
ConversationSchema.index({ user: 1, igUserId: 1 }, { unique: true });
ConversationSchema.index({ user: 1, lastMessageAt: -1 });

const Conversation =
  mongoose.models.Conversation || mongoose.model("Conversation", ConversationSchema);

export default Conversation;
