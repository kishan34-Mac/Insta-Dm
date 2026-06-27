import {
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshUserTokens,
  registerUser,
  googleAuthUser,
} from "../services/auth.service.js";

import { sendSuccess } from "../utils/apiResponse.js";

/* ==========================================================
   REGISTER
========================================================== */

export const register = async (req, res, next) => {
  try {
    const data = await registerUser(req.body);

    res.cookie("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    delete data.refreshToken;

    sendSuccess(res, {
      statusCode: 201,
      message: "Registration successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

/* ==========================================================
   LOGIN
========================================================== */

export const login = async (req, res, next) => {
  try {
    const { email, password, isAdmin = false, adminSecret } = req.body;

    const data = await loginUser({
      email,
      password,
      isAdmin,
      adminSecret,
    });

    res.cookie("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    delete data.refreshToken;

    sendSuccess(res, {
      message: "Login successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

/* ==========================================================
   GOOGLE LOGIN
========================================================== */

export const googleAuth = async (req, res, next) => {
  try {
    const data = await googleAuthUser(
      req.body.credential,
      req.body.mode,
      req.body.plan,
    );

    res.cookie("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    delete data.refreshToken;

    sendSuccess(res, {
      message: "Google login successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

/* ==========================================================
   CURRENT USER
========================================================== */

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

/* ==========================================================
   REFRESH TOKEN
========================================================== */

export const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    const tokens = await refreshUserTokens(refreshToken);

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    delete tokens.refreshToken;

    sendSuccess(res, {
      message: "Token refreshed successfully",
      data: tokens,
    });
  } catch (err) {
    next(err);
  }
};

/* ==========================================================
   LOGOUT
========================================================== */

export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    await logoutUser({
      userId: req.userId,
      refreshToken,
    });

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
  googleAuth,
  getMe,
  refresh,
  logout,
};
