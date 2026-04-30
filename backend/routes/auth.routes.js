import express from "express";
import {
  register,
  login,
  getMe,
  refresh,
  logout,
} from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

/**
 * Authentication Routes
 * Handles user registration, login, and token management
 */

//

const router = express.Router();

// @route   POST /auth/register
// @desc   Register new user
// @access Public
router.post("/register", register);

// @route   POST /auth/login
// @desc   Login user
// @access Public
router.post("/login", login);

// @route   GET /auth/me
// @desc   Get current user
// @access Private
router.get("/me", protect, getMe);

// @route   POST /auth/refresh
// @desc   Refresh access token
// @access Public
router.post("/refresh", refresh);

// @route   POST /auth/logout
// @desc   Logout user
// @access Private
router.post("/logout", protect, logout);

export default router;
