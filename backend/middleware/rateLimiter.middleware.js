import rateLimit from "express-rate-limit";

// Allow 5 login attempts per 15 minutes per IP
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5,
  message: {
    success: false,
    message: "Too many login attempts from this IP, please try again after 15 minutes",
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// Allow 5 signup attempts per hour per IP
export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many signups from this IP, please try again after an hour",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Allow 3 password reset attempts per hour per IP
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: "Too many password reset requests from this IP, please try again after an hour",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Allow 3 email verification attempts per hour per IP
export const emailVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: "Too many verification requests from this IP, please try again after an hour",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
