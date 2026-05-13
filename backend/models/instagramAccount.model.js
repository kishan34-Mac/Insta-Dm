import mongoose from "mongoose";

const instagramAccountSchema = new mongoose.Schema(
  {
    igUserId: {
      type: String,
      required: true,
    },
    igUsername: {
      type: String,
      required: true,
    },
    pageId: {
      type: String,
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    tokenExpiresAt: {
      type: Date,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const InstagramAccount = mongoose.model(
  "InstagramAccount",
  instagramAccountSchema
);

export default InstagramAccount;