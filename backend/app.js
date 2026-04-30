// ============================================
// PROJECT SETUP - Express App
// ============================================

import express from "express";

// Import routes
import authRoutes from "./routes/auth.routes.js";
import instagramRoutes from "./routes/instagram.routes.js";

// Import utilities
import { errorHandler } from "./utils/errorHandler.js";

// Initialize Express
const app = express();

//

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// ============================================
// API Routes
// ============================================

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running!",
    timestamp: new Date().toISOString(),
  });
});

// Auth routes
app.use("/auth", authRoutes);

// Instagram OAuth routes
app.use("/auth/instagram", instagramRoutes);

// ============================================
// Error Handler Middleware
// ============================================

// 404 handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use(errorHandler);

export default app;
