import {
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshUserTokens,
  registerUser,
} from "../services/auth.service.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const register = async (req, res, next) => {
  try {
    const data = await registerUser(req.body);
    sendSuccess(res, {
      statusCode: 201,
      message: "User registered successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const data = await loginUser(req.body);
    sendSuccess(res, {
      message: "Login successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await getCurrentUser(req.userId);
    sendSuccess(res, {
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const tokens = await refreshUserTokens(req.body.refreshToken);
    sendSuccess(res, {
      message: "Token refreshed successfully",
      data: tokens,
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    await logoutUser({ userId: req.userId, refreshToken: req.body.refreshToken });
    sendSuccess(res, {
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
