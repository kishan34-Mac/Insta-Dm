import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Instagram Account Subdocument Schema
const InstagramAccountSchema = new mongoose.Schema(
  {
// Main User Schema
const UserSchema = new mongoose.Schema(
  {
// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ plan: 1 });
// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
// Compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
// Remove sensitive fields when converting to JSON
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
// Refresh token helpers
UserSchema.methods.addRefreshToken = function (token) {
  if (!Array.isArray(this.refreshTokens)) this.refreshTokens = [];
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Instagram Account Subdocument Schema
const InstagramAccountSchema = new mongoose.Schema(
  {
    igUserId: { type: String, required: true },
    igUsername: { type: String, required: true },
    pageId: { type: String, required: true },
    accessToken: { type: String, required: true },
    tokenExpiry: { type: Date, required: true },
    connectedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { _id: false },
);

// Main User Schema
const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    plan: {
      type: String,
      enum: ['free', 'starter', 'pro', 'agency'],
      default: 'free',
    },
    instagramAccounts: {
      type: [InstagramAccountSchema],
      default: [],
    },
    billingCustomerId: { type: String, default: null },
    refreshTokens: { type: [String], default: [] },
  },
  { timestamps: true },
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ plan: 1 });

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// Compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Remove sensitive fields when converting to JSON
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.refreshTokens;
  if (obj.instagramAccounts) {
    obj.instagramAccounts = obj.instagramAccounts.map((acc) => ({
      ...acc,
      accessToken: '********',
    }));
  }
  return obj;
};

// Refresh token helpers
UserSchema.methods.addRefreshToken = function (token) {
  if (!Array.isArray(this.refreshTokens)) this.refreshTokens = [];
  if (this.refreshTokens.length >= 5) {
    this.refreshTokens = this.refreshTokens.slice(-4);
  }
  this.refreshTokens.push(token);
};

UserSchema.methods.removeRefreshToken = function (token) {
  this.refreshTokens = (this.refreshTokens || []).filter((t) => t !== token);
};

UserSchema.methods.clearRefreshTokens = function () {
  this.refreshTokens = [];
};

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
