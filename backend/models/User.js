import bcrypt from "bcrypt";
import mongoose from "mongoose";

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
      select: false, // 🔐 never return password in queries
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
      select: false, // 🔐 hide tokens
    },
  },
  { timestamps: true }
);

UserSchema.index({ plan: 1 });

/* 🔐 HASH PASSWORD BEFORE SAVE */
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

/* 🔑 COMPARE PASSWORD */
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/* 🧼 CLEAN RESPONSE */
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();

  delete obj.password;
  delete obj.refreshTokens;

  if (Array.isArray(obj.instagramAccounts)) {
    obj.instagramAccounts = obj.instagramAccounts.map((acc) => ({
      ...acc,
      accessToken: "********",
    }));
  }

  return obj;
};

/* 🔄 REFRESH TOKEN HELPERS */
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

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;