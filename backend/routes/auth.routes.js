import express from "express";
import {
  getMe,
  login,
  logout,
  refresh,
  register,
  googleAuth,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  setupMFA,
  verifyMFASetup,
  verifyMFALoginController,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import {
  loginSchema,
  logoutSchema,
  refreshTokenSchema,
  registerSchema,
  googleAuthSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  mfaSetupSchema,
  mfaVerifySchema,
  validate,
} from "../validators/auth.validator.js";
import {
  loginLimiter,
  signupLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
} from "../middleware/rateLimiter.middleware.js";

const router = express.Router();

router.post("/register", signupLimiter, validate(registerSchema), register);

router.post("/login", loginLimiter, validate(loginSchema), login);

router.post("/google", loginLimiter, validate(googleAuthSchema), googleAuth);

router.get("/me", protect, getMe);

router.post("/refresh", validate(refreshTokenSchema), refresh);

router.post("/logout", protect, validate(logoutSchema), logout);

// Password Reset Endpoints
router.post(
  "/forgot-password",
  passwordResetLimiter,
  validate(forgotPasswordSchema),
  forgotPassword
);

router.post(
  "/reset-password",
  passwordResetLimiter,
  validate(resetPasswordSchema),
  resetPassword
);

// Email Verification Endpoints
router.get(
  "/verify-email",
  emailVerificationLimiter,
  validate(verifyEmailSchema),
  verifyEmail
);

router.post(
  "/resend-verification",
  emailVerificationLimiter,
  validate(resendVerificationSchema),
  resendVerification
);

// Multi-Factor Authentication Endpoints
router.post("/mfa/setup", protect, validate(mfaSetupSchema), setupMFA);

router.post("/mfa/verify", protect, validate(mfaVerifySchema), verifyMFASetup);

router.post("/mfa/login", loginLimiter, validate(mfaVerifySchema), verifyMFALoginController);

export default router;
