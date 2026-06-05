import { AppError } from "../utils/errorHandler.js";
import { generateTokens, verifyRefreshToken } from "../utils/jwt.js";
import User from "../models/User.js";
import crypto from "crypto";
import axios from "axios";

const buildAuthPayload = (user, tokens) => ({
  user: user.toJSON(),
  accessToken: tokens.accessToken,
  refreshToken: tokens.refreshToken,
});

export const registerUser = async ({ email, password, name, plan }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("User with this email already exists", 409);
  }

  const user = new User({ email, password, name, plan: plan || "free" });
  await user.save();

  const tokens = generateTokens(user._id.toString());
  user.addRefreshToken(tokens.refreshToken);
  await user.save();

  return buildAuthPayload(user, tokens);
};

export const googleAuthUser = async (credential, mode, plan) => {
  try {
    // decode jwt payload without verification
    const parts = credential.split('.');
    if (parts.length !== 3) {
      throw new AppError("Invalid credential format", 401);
    }

    // parse base64 payload
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(
      Buffer.from(base64, 'base64').toString('utf-8')
    );

    const { email, name, picture } = decoded;

    if (!email) {
      throw new AppError("Could not retrieve email from Google", 401);
    }

    let user = await User.findOne({ email }).select("+refreshTokens");

    if (!user) {
      if (mode === "login") {
        throw new AppError("Account not found. Please sign up first.", 404);
      }
      // create user with random secure password
      const randomPassword = crypto.randomBytes(32).toString("hex");
      user = new User({ email, name, password: randomPassword, plan: plan || "free" });
      await user.save();
    } else {
      if (plan && user.plan !== plan) {
        // update plan if specific link was used
        user.plan = plan;
        await user.save();
      }
    }

    const tokens = generateTokens(user._id.toString());
    user.addRefreshToken(tokens.refreshToken);
    await user.save();

    return buildAuthPayload(user, tokens);
  } catch (error) {
    console.error("Google Auth Error:", error.message);
    if (error instanceof AppError) throw error;
    throw new AppError("Invalid Google credential", 401);
  }
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password +refreshTokens +loginAttempts +lockUntil");
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  if (user.isLocked) {
    throw new AppError("Account is temporarily locked due to multiple failed login attempts. Please try again later.", 403);
  }

  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    // Increment login attempts
    user.loginAttempts += 1;
    
    // Lock account if max attempts reached (e.g. 5)
    if (user.loginAttempts >= 5) {
      user.lockUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 minutes
    }
    
    await user.save();
    throw new AppError("Invalid email or password", 401);
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0 || user.lockUntil) {
    user.loginAttempts = 0;
    user.lockUntil = undefined;
  }

  const tokens = generateTokens(user._id.toString());
  user.addRefreshToken(tokens.refreshToken);
  
  user.lastLoginAt = new Date();
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
