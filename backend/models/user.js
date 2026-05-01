import mongoose from "mongoose";
import bcrypt from "bcrypt";

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
      enum: ["free", "starter", "pro", "agency"],
      default: "free",
    },
    instagramAccounts: {
      type: [InstagramAccountSchema],
      default: [],
    },
    billingCustomerId: {
      type: String,
      default: null,
    },
    refreshTokens: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

UserSchema.index({ email: 1 });
UserSchema.index({ plan: 1 });

UserSchema.pre("save", async function preSave(next) {
  if (!this.isModified("passwordHash")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    return next();
  } catch (error) {
    return next(error);
  }
});

UserSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

UserSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.refreshTokens;

  if (Array.isArray(obj.instagramAccounts)) {
    obj.instagramAccounts = obj.instagramAccounts.map((account) => ({
      ...account,
      accessToken: "********",
    }));
  }

  return obj;
};

UserSchema.methods.addRefreshToken = function addRefreshToken(token) {
  if (!Array.isArray(this.refreshTokens)) {
    this.refreshTokens = [];
  }

  if (this.refreshTokens.length >= 5) {
    this.refreshTokens = this.refreshTokens.slice(-4);
  }

  this.refreshTokens.push(token);
};

UserSchema.methods.removeRefreshToken = function removeRefreshToken(token) {
  this.refreshTokens = (this.refreshTokens || []).filter((currentToken) => currentToken !== token);
};

UserSchema.methods.clearRefreshTokens = function clearRefreshTokens() {
  this.refreshTokens = [];
};

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
