import User from "../models/User.js";
import {
  generateTokens,
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.js";
import { AppError } from "../utils/errorHandler.js";

/**
 * Authentication Controller
 * Handles user registration, login, and token management
 */

//

// @desc    Register new user
// @route   POST /auth/register
export const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      throw new AppError("Email, password, and name are required", 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new AppError("User with this email already exists", 400);
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      passwordHash: password,
      name: name.trim(),
    });

    // Save user to database
    await user.save();

    // Generate tokens
    const tokens = generateTokens(user._id);

    // Store refresh token
    user.addRefreshToken(tokens.refreshToken);
    await user.save();

    // Return response
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: user.toJSON(),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new AppError("Invalid email or password", 401);
    }

    // Generate tokens
    const tokens = generateTokens(user._id);

    // Store refresh token
    user.addRefreshToken(tokens.refreshToken);
    await user.save();

    // Return response
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: user.toJSON(),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user
// @route   GET /auth/me
export const getMe = async (req, res, next) => {
  try {
    // req.userId is set by auth middleware
    const user = await User.findById(req.userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({
      success: true,
      data: {
        user: user.toJSON(),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Refresh access token
// @route   POST /auth/refresh
export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError("Refresh token is required", 400);
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user and check if refresh token exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Check if refresh token is valid
    if (!user.refreshTokens.includes(refreshToken)) {
      // Clear all refresh tokens for security
      user.clearRefreshTokens();
      await user.save();
      throw new AppError("Invalid refresh token", 401);
    }

    // Remove old refresh token
    user.removeRefreshToken(refreshToken);

    // Generate new tokens
    const tokens = generateTokens(user._id);

    // Store new refresh token
    user.addRefreshToken(tokens.refreshToken);
    await user.save();

    // Return response
    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user
// @route   POST /auth/logout
export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    // Get user
    const user = await User.findById(req.userId);
    if (user && refreshToken) {
      user.removeRefreshToken(refreshToken);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (err) {
    next(err);
  }
};

export default {
  register,
  login,
  getMe,
  refresh,
  logout,
};
