import { AppError } from "../utils/errorHandler.js";
import { generateTokens, verifyRefreshToken, verifyAccessToken } from "../utils/jwt.js";
import User from "../models/User.js";
import crypto from "crypto";
import axios from "axios";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import env from "../config/env.js";
import { encrypt, decrypt } from "../utils/encryption.js";
import { generateBase32Secret, verifyTOTP } from "../utils/totp.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordResetConfirmation,
} from "./email.service.js";

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

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

  // Create verification token (expiring in 24 hours)
  const verificationRawToken = crypto.randomBytes(32).toString("hex");
  const verificationToken = crypto
    .createHash("sha256")
    .update(verificationRawToken)
    .digest("hex");
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = new User({
    email,
    password,
    name,
    plan: plan || "free",
    isVerified: false,
    verificationToken,
    verificationExpires,
  });
  await user.save();

  // Send verification email asynchronously (non-blocking)
  sendVerificationEmail(email, verificationRawToken).catch((err) =>
    console.error("Failed to send verification email:", err.message)
  );

  const tokens = generateTokens(user._id.toString());
  user.addRefreshToken(tokens.refreshToken);
  await user.save();

  return buildAuthPayload(user, tokens);
};

export const googleAuthUser = async (credential, mode, plan) => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      throw new AppError("Invalid Google token payload", 401);
    }

    const { email, name, picture } = payload;

    if (!email) {
      throw new AppError("Could not retrieve email from Google token payload", 401);
    }

    let user = await User.findOne({ email }).select("+refreshTokens");

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
        isVerified: true, // pre-verified by Google identity
      });
      await user.save();
    } else {
      if (plan && user.plan !== plan) {
        user.plan = plan;
      }
      if (!user.isVerified) {
        user.isVerified = true;
      }
      await user.save();
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
  const user = await User.findOne({ email }).select(
    "+password +refreshTokens +loginAttempts +lockUntil +mfaEnabled +mfaSecret"
  );
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  if (user.isLocked) {
    throw new AppError(
      "Account is temporarily locked due to multiple failed login attempts. Please try again later.",
      403
    );
  }

  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    user.loginAttempts += 1;
    if (user.loginAttempts >= 5) {
      user.lockUntil = Date.now() + 15 * 60 * 1000;
    }
    await user.save();
    throw new AppError("Invalid email or password", 401);
  }

  if (user.loginAttempts > 0 || user.lockUntil) {
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();
  }

  // Enforce Multi-Factor Authentication step
  if (user.mfaEnabled) {
    const tempToken = jwt.sign(
      { userId: user._id.toString(), mfaTemp: true },
      env.JWT_SECRET,
      { expiresIn: "5m", algorithm: "HS256" }
    );
    return {
      mfaRequired: true,
      tempToken,
    };
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
    isVerified: user.isVerified,
    mfaEnabled: user.mfaEnabled,
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

// --- EMAIL VERIFICATION SERVICES ---

export const sendVerificationToken = async (userId) => {
  const user = await User.findById(userId).select("+verificationToken +verificationExpires");
  if (!user) {
    throw new AppError("User not found", 404);
  }
  if (user.isVerified) {
    throw new AppError("User email is already verified", 400);
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  user.verificationToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  user.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  await sendVerificationEmail(user.email, rawToken);
};

export const verifyUserEmail = async (rawToken) => {
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError("Invalid or expired email verification token", 400);
  }

  user.isVerified = true;
  user.verificationToken = null;
  user.verificationExpires = null;
  await user.save();
  return user;
};

// --- PASSWORD RESET SERVICES ---

export const requestPasswordReset = async (email) => {
  const user = await User.findOne({ email });
  // Protect against email enumeration: do not disclose if user exists
  if (!user) {
    return { success: true };
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
  await user.save();

  await sendPasswordResetEmail(user.email, rawToken);
  return { success: true };
};

export const resetUserPassword = async (rawToken, newPassword) => {
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError("Invalid or expired password reset token", 400);
  }

  user.password = newPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  // Send confirmation email asynchronously
  sendPasswordResetConfirmation(user.email).catch((err) =>
    console.error("Failed to send reset confirmation:", err.message)
  );
};

// --- MFA TOTP SERVICES ---

export const setupUserMFA = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const rawSecret = generateBase32Secret();
  user.mfaSecret = encrypt(rawSecret);
  await user.save();

  const otpauthUrl = `otpauth://totp/InstaDm:${user.email}?secret=${rawSecret}&issuer=InstaDm`;
  return {
    secret: rawSecret,
    otpauthUrl,
  };
};

export const verifyUserMFASetup = async (userId, code) => {
  const user = await User.findById(userId).select("+mfaSecret");
  if (!user || !user.mfaSecret) {
    throw new AppError("MFA setup was not initiated", 400);
  }

  const decryptedSecret = decrypt(user.mfaSecret);
  const isValid = verifyTOTP(code, decryptedSecret);
  if (!isValid) {
    throw new AppError("Invalid verification code, please try again", 400);
  }

  const recoveryCodes = Array.from({ length: 5 }, () =>
    crypto.randomBytes(6).toString("hex")
  );
  
  user.mfaRecoveryCodes = recoveryCodes.map((c) => encrypt(c));
  user.mfaEnabled = true;
  await user.save();

  return recoveryCodes;
};

export const verifyUserMFALogin = async (tempToken, code, recoveryCode) => {
  let decoded;
  try {
    decoded = jwt.verify(tempToken, env.JWT_SECRET, { algorithms: ["HS256"] });
  } catch (err) {
    throw new AppError("Invalid or expired verification session", 401);
  }

  if (!decoded.mfaTemp) {
    throw new AppError("Invalid session context", 401);
  }

  const user = await User.findById(decoded.userId).select(
    "+mfaSecret +mfaRecoveryCodes +refreshTokens"
  );
  if (!user) {
    throw new AppError("User session no longer exists", 404);
  }

  if (recoveryCode) {
    let matchedIndex = -1;
    for (let i = 0; i < user.mfaRecoveryCodes.length; i++) {
      if (decrypt(user.mfaRecoveryCodes[i]) === recoveryCode) {
        matchedIndex = i;
        break;
      }
    }

    if (matchedIndex === -1) {
      throw new AppError("Invalid recovery code", 400);
    }

    user.mfaRecoveryCodes.splice(matchedIndex, 1);
    await user.save();
  } else if (code) {
    const decryptedSecret = decrypt(user.mfaSecret);
    const isValid = verifyTOTP(code, decryptedSecret);
    if (!isValid) {
      throw new AppError("Invalid MFA verification code", 400);
    }
  } else {
    throw new AppError("MFA code or recovery code is required", 400);
  }

  const tokens = generateTokens(user._id.toString());
  user.addRefreshToken(tokens.refreshToken);
  user.lastLoginAt = new Date();
  await user.save();

  return buildAuthPayload(user, tokens);
};
