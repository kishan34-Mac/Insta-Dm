import {
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshUserTokens,
  registerUser,
  googleAuthUser,
  requestPasswordReset,
  resetUserPassword,
  verifyUserEmail,
  sendVerificationToken,
  setupUserMFA,
  verifyUserMFASetup,
  verifyUserMFALogin,
} from "../services/auth.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import User from "../models/User.js";

export const register = async (req, res, next) => {
  try {
    console.log('[auth.register] incoming body:', req.body);
    const data = await registerUser(req.body);
    
    // Set HTTP-Only Cookie for Access Token
    res.cookie("accessToken", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

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

    if (data.mfaRequired) {
      return sendSuccess(res, {
        message: "MFA code required to complete login",
        data: {
          mfaRequired: true,
          tempToken: data.tempToken,
        },
      });
    }

    // Set HTTP-Only Cookie for Access Token
    res.cookie("accessToken", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

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

    // Set HTTP-Only Cookie for Access Token
    res.cookie("accessToken", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

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

    // Set HTTP-Only Cookie for Access Token
    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

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
    
    // Clear cookies
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
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

// --- PASSWORD RESET CONTROLLERS ---

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    await requestPasswordReset(email);
    sendSuccess(res, {
      message: "If that email is registered, a password reset link has been dispatched.",
    });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    await resetUserPassword(token, password);
    sendSuccess(res, {
      message: "Password reset successfully.",
    });
  } catch (err) {
    next(err);
  }
};

// --- EMAIL VERIFICATION CONTROLLERS ---

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    await verifyUserEmail(token);
    sendSuccess(res, {
      message: "Email verified successfully.",
    });
  } catch (err) {
    next(err);
  }
};

export const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return sendSuccess(res, {
        message: "If that email is registered, a verification link has been dispatched.",
      });
    }
    await sendVerificationToken(user._id);
    sendSuccess(res, {
      message: "If that email is registered, a verification link has been dispatched.",
    });
  } catch (err) {
    next(err);
  }
};

// --- MFA TOTP CONTROLLERS ---

export const setupMFA = async (req, res, next) => {
  try {
    const data = await setupUserMFA(req.userId);
    sendSuccess(res, {
      message: "MFA setup initiated.",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const verifyMFASetup = async (req, res, next) => {
  try {
    const { code } = req.body;
    const recoveryCodes = await verifyUserMFASetup(req.userId, code);
    sendSuccess(res, {
      message: "MFA setup complete. Store your recovery codes safely.",
      data: { recoveryCodes },
    });
  } catch (err) {
    next(err);
  }
};

export const verifyMFALoginController = async (req, res, next) => {
  try {
    const tempToken = req.headers["x-mfa-session"] || req.body.tempToken;
    const { code, recoveryCode } = req.body;
    const data = await verifyUserMFALogin(tempToken, code, recoveryCode);

    // Set HTTP-Only Cookie for Access Token
    res.cookie("accessToken", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    // Set HTTP-Only Cookie for Refresh Token
    res.cookie("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    delete data.refreshToken;

    sendSuccess(res, {
      message: "Multi-Factor Authentication successful.",
      data,
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
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  setupMFA,
  verifyMFASetup,
  verifyMFALoginController,
};
