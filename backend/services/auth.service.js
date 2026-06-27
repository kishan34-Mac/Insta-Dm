import { AppError } from "../utils/errorHandler.js";
import { generateTokens, verifyRefreshToken } from "../utils/jwt.js";
import User from "../models/User.js";
import crypto from "crypto";

const buildAuthPayload = (user, tokens) => ({
  user: user.toJSON(),
  accessToken: tokens.accessToken,
  refreshToken: tokens.refreshToken,
});

export const registerUser = async ({
  email,
  password,
  name,
  plan,
  isAdmin,
  adminSecret,
}) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError("User with this email already exists", 409);
  }

  let role = "user";

  if (isAdmin) {
    if (!adminSecret) {
      throw new AppError("Admin Secret Key is required", 400);
    }

    if (adminSecret !== process.env.ADMIN_SECRET) {
      throw new AppError("Invalid Admin Secret Key", 403);
    }

    role = "admin";
  }

  const user = new User({
    email,
    password,
    name,
    role,
    plan: plan || "free",
  });

  await user.save();

  const tokens = generateTokens(user._id.toString());

  user.addRefreshToken(tokens.refreshToken);

  await user.save();

  return buildAuthPayload(user, tokens);
};

export const googleAuthUser = async (credential, mode, plan) => {
  try {
    const parts = credential.split(".");

    if (parts.length !== 3) {
      throw new AppError("Invalid credential format", 401);
    }

    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");

    const decoded = JSON.parse(Buffer.from(base64, "base64").toString("utf8"));

    const { email, name } = decoded;

    if (!email) {
      throw new AppError("Could not retrieve email from Google", 401);
    }

    let user = await User.findOne({
      email,
    }).select("+refreshTokens");

    if (!user) {
      if (mode === "login") {
        throw new AppError("Account not found. Please sign up first.", 404);
      }

      const randomPassword = crypto.randomBytes(32).toString("hex");

      user = new User({
        email,
        name,
        password: randomPassword,
        plan: plan || "free",
      });

      await user.save();
    } else if (plan && user.plan !== plan) {
      user.plan = plan;
      await user.save();
    }

    const tokens = generateTokens(user._id.toString());

    user.addRefreshToken(tokens.refreshToken);

    await user.save();

    return buildAuthPayload(user, tokens);
  } catch (err) {
    console.error(err);

    if (err instanceof AppError) throw err;

    throw new AppError("Invalid Google credential", 401);
  }
};

/* ==========================================================
   LOGIN
   ========================================================== */

export const loginUser = async ({
  email,
  password,
  isAdmin = false,
  adminSecret,
}) => {
  const user = await User.findOne({
    email,
  }).select("+password +refreshTokens +loginAttempts +lockUntil");

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  if (user.isLocked) {
    throw new AppError("Account is temporarily locked. Please try later.", 403);
  }

  const validPassword = await user.comparePassword(password);

  if (!validPassword) {
    user.loginAttempts += 1;

    if (user.loginAttempts >= 5) {
      user.lockUntil = Date.now() + 15 * 60 * 1000;
    }

    await user.save();

    throw new AppError("Invalid email or password", 401);
  }

  /* ---------- ADMIN LOGIN ---------- */

  if (isAdmin) {
    if (user.role !== "admin") {
      throw new AppError("You are not an administrator.", 403);
    }

    if (!adminSecret) {
      throw new AppError("Admin Secret Key is required.", 400);
    }

    if (adminSecret !== process.env.ADMIN_SECRET) {
      throw new AppError("Invalid Admin Secret Key.", 403);
    }
  }

  /* ---------- RESET LOGIN ATTEMPTS ---------- */

  user.loginAttempts = 0;
  user.lockUntil = undefined;

  user.lastLoginAt = new Date();

  const tokens = generateTokens(user._id.toString());

  user.addRefreshToken(tokens.refreshToken);

  await user.save();

  return buildAuthPayload(user, tokens);
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    plan: user.plan,
  };
};

export const refreshUserTokens = async (refreshToken) => {
  const decoded = verifyRefreshToken(refreshToken);

  const user = await User.findById(decoded.userId).select("+refreshTokens");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.refreshTokens.includes(refreshToken)) {
    user.clearRefreshTokens();

    await user.save();

    throw new AppError("Invalid refresh token", 401);
  }

  user.removeRefreshToken(refreshToken);

  const tokens = generateTokens(user._id.toString());

  user.addRefreshToken(tokens.refreshToken);

  await user.save();

  return tokens;
};

export const logoutUser = async ({ userId, refreshToken }) => {
  if (!refreshToken) return;

  const user = await User.findById(userId).select("+refreshTokens");

  if (user) {
    user.removeRefreshToken(refreshToken);

    await user.save();
  }
};
