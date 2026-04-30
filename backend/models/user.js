import mongoose from "mongoose";
import bcrypt from "bcrypt";

/**
 * User Model
 * Handles user data and Instagram account connections
 */

// ============================================
// STEP 3: DATABASE MODELS
// ============================================

// Instagram Account Subdocument Schema
const InstagramAccountSchema = new mongoose.Schema(
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
    tokenExpiry: {
      type: Date,
      required: true,
    },
    connectedAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: false,
  },
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
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
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
  {
    timestamps: true,
  },
);

// ============================================
// STEP 3: Indexes
// ============================================

// Index for email (unique is already set, but this ensures quick lookup)
UserSchema.index({ email: 1 });

// Index for plan
UserSchema.index({ plan: 1 });

// ============================================
// STEP 3: User Model Methods
// ============================================

// Hash password before saving
UserSchema.pre("save", async function (next) {
  // Only hash password if it has been modified
  if (!this.isModified("passwordHash")) {
    return next();
  }

  try {
    // Hash password with salt 12
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Transform output to remove sensitive fields
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.refreshTokens;
  // Mask Instagram access tokens in response
  if (obj.instagramAccounts) {
    obj.instagramAccounts = obj.instagramAccounts.map((acc) => ({
      ...acc,
      accessToken: "********",
    }));
  }
  return obj;
};

// ============================================
// STEP 4: Auth - Add refresh token
// ============================================

UserSchema.methods.addRefreshToken = function (token) {
  // Keep only last 5 refresh tokens
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

// Create and export User model
const User = mongoose.model("User", UserSchema);

export default User;
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
