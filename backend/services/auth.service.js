import { AppError } from "../utils/errorHandler.js";
import { generateTokens, verifyRefreshToken } from "../utils/jwt.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

// In-memory mock database for testing without MongoDB
const MOCK_USERS = [];

const buildAuthPayload = (user, tokens) => ({
  user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    plan: user.plan || "free",
  },
  accessToken: tokens.accessToken,
  refreshToken: tokens.refreshToken,
});

export const registerUser = async ({ email, password, name }) => {
  const existingUser = MOCK_USERS.find((u) => u.email === email);
  if (existingUser) {
    throw new AppError("User with this email already exists", 409);
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = {
    _id: crypto.randomBytes(12).toString('hex'),
    email,
    passwordHash,
    name,
    plan: "free",
    refreshTokens: [],
  };

  const tokens = generateTokens(user._id);
  user.refreshTokens.push(tokens.refreshToken);
  
  MOCK_USERS.push(user);
  return buildAuthPayload(user, tokens);
};

export const loginUser = async ({ email, password }) => {
  const user = MOCK_USERS.find((u) => u.email === email);
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    throw new AppError("Invalid email or password", 401);
  }

  const tokens = generateTokens(user._id);
  user.refreshTokens.push(tokens.refreshToken);

  return buildAuthPayload(user, tokens);
};

export const getCurrentUser = async (userId) => {
  const user = MOCK_USERS.find((u) => u._id === userId);
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
  const user = MOCK_USERS.find((u) => u._id === decoded.userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.refreshTokens.includes(refreshToken)) {
    user.refreshTokens = [];
    throw new AppError("Invalid refresh token", 401);
  }

  user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
  const tokens = generateTokens(user._id);
  user.refreshTokens.push(tokens.refreshToken);

  return tokens;
};

export const logoutUser = async ({ userId, refreshToken }) => {
  if (!refreshToken) return;
  const user = MOCK_USERS.find((u) => u._id === userId);
  if (user) {
    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
  }
};
