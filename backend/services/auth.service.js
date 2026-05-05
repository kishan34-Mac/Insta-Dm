import { AppError } from "../utils/errorHandler.js";
import { generateTokens, verifyRefreshToken } from "../utils/jwt.js";
import User from "../models/User.js";

const buildAuthPayload = (user, tokens) => ({
  user: user.toJSON(),
  accessToken: tokens.accessToken,
  refreshToken: tokens.refreshToken,
});

export const registerUser = async ({ email, password, name }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("User with this email already exists", 409);
  }

  const user = new User({ email, password, name, plan: "free" });
  await user.save();

  const tokens = generateTokens(user._id.toString());
  user.addRefreshToken(tokens.refreshToken);
  await user.save();

  return buildAuthPayload(user, tokens);
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password +refreshTokens");
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    throw new AppError("Invalid email or password", 401);
  }

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
