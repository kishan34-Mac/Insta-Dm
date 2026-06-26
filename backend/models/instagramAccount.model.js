import mongoose from "mongoose";
import { encrypt, decrypt } from "../utils/encryption.js";

const instagramAccountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    igUserId: {
      type: String,
      required: true,
      unique: true,
    },

    igUsername: {
      type: String,
      required: true,
    },

    pageId: {
      type: String,
      required: true,
    },

    pageName: {
      type: String,
    },

    accessToken: {
      type: String,
      required: true,
      set: encrypt,
      get: decrypt,
    },

    profilePicture: {
      type: String,
    },

    tokenExpiresAt: {
      type: Date,
    },

    connectedAt: {
      type: Date,
      default: Date.now,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    webhookSubscribed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

instagramAccountSchema.index({
  user: 1,
});

const InstagramAccount =
  mongoose.models.InstagramAccount ||
  mongoose.model("InstagramAccount", instagramAccountSchema);

export default InstagramAccount;