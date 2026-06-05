import {
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshUserTokens,
  registerUser,
  googleAuthUser,
} from "../services/auth.service.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const register = async (req, res, next) => {
  try {
    console.log('[auth.register] incoming body:', req.body);
    const data = await registerUser(req.body);
    
    // Set HTTP-Only Cookie for Refresh Token
    res.cookie("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Remove refreshToken from response body
    delete data.refreshToken;

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

    // Set HTTP-Only Cookie for Refresh Token
    res.cookie("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Remove refreshToken from response body
    delete data.refreshToken;

    sendSuccess(res, {
      message: "Login successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const googleAuth = async (req, res, next) => {
  try {
    console.log('[auth.google] incoming body:', req.body);
    const data = await googleAuthUser(req.body.credential, req.body.mode, req.body.plan);

    // Set HTTP-Only Cookie for Refresh Token
    res.cookie("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Remove refreshToken from response body
    delete data.refreshToken;

    sendSuccess(res, {
      message: "Google login successful",
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
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "Refresh token missing" });
    }

    const tokens = await refreshUserTokens(refreshToken);

    // Set new HTTP-Only Cookie for Refresh Token
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Remove refreshToken from response body
    delete tokens.refreshToken;

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
    const refreshToken = req.cookies?.refreshToken;
    await logoutUser({ userId: req.userId, refreshToken });
    
    // Clear cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

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
  googleAuth,
};
