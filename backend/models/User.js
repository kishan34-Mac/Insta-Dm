import bcrypt from "bcrypt";
import mongoose from "mongoose";

const InstagramAccountSchema = new mongoose.Schema(
  {
    igUserId: {
      type: String,
      required: true,
      index: true,
    },

    igUsername: {
      type: String,
      required: true,
      trim: true,
    },

    pageId: {
      type: String,
      required: true,
    },

    pageName: {
      type: String,
      default: null,
    },

    accessToken: {
      type: String,
      required: true,
      select: false,
    },

    pageAccessToken: {
      type: String,
      default: null,
      select: false,
    },

    tokenType: {
      type: String,
      default: "bearer",
    },

    scopes: {
      type: [String],
      default: [],
    },

    tokenExpiry: {
      type: Date,
      required: true,
    },

    webhookSubscribed: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    connectedAt: {
      type: Date,
      default: Date.now,
    },

    lastSyncedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
      maxlength: 255,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },

    plan: {
      type: String,
      enum: ["free", "starter", "pro", "agency"],
      default: "free",
    },

    subscriptionStatus: {
      type: String,
      enum: ["free", "pending", "active", "failed"],
      default: "free",
      index: true,
    },

    subscriptionStartDate: {
      type: Date,
      default: null,
    },

    subscriptionEndDate: {
      type: Date,
      default: null,
    },


    instagramAccounts: {
      type: [InstagramAccountSchema],
      default: [],
    },

    billingCustomerId: {
      type: String,
      default: null,
    },

    billingStatus: {
      type: String,
      enum: ["free", "pending", "active", "failed"],
      default: "free",
    },

    currentBillingPlan: {
      type: String,
      enum: ["starter", "pro", "agency"],
      default: null,
    },

    razorpayCustomerId: {
      type: String,
      default: null,
    },

    razorpayOrderId: {
      type: String,
      default: null,
    },

    refreshTokens: {
      type: [String],
      default: [],
      select: false,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

 
UserSchema.index({ plan: 1 });

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

 
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.addRefreshToken = function (token) {
  if (this.refreshTokens.length >= 5) {
    this.refreshTokens = this.refreshTokens.slice(-4);
  }

  this.refreshTokens.push(token);
};

UserSchema.methods.removeRefreshToken = function (token) {
  this.refreshTokens = this.refreshTokens.filter((t) => t !== token);
};

UserSchema.methods.clearRefreshTokens = function () {
  this.refreshTokens = [];
};

UserSchema.methods.toJSON = function () {
  const obj = this.toObject();

  delete obj.password;
  delete obj.refreshTokens;

  if (Array.isArray(obj.instagramAccounts)) {
    obj.instagramAccounts = obj.instagramAccounts.map((acc) => ({
      ...acc,
      accessToken: undefined,
      pageAccessToken: undefined,
    }));
  }

  return obj;
};

const User =
  mongoose.models.User || mongoose.model("User", UserSchema);

export default User;