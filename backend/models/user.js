import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    plan: {
      type: String,
      enum: ['free', 'starter', 'pro', 'agency'],
      default: 'free'
    },
    instagramAccounts: [],
    billingCustomerId: {
      type: String,
      default: null
    }
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false }
  }
);

const User = mongoose.model('User', UserSchema); 

export default User;