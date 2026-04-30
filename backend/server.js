// ============================================
// Server Entry Point
// ============================================
import express from "express";
import dotenv from 'dotenv'
import connectDB from "./config/db.js";
import authRoutes from './routes/authRoutes.js'
dotenv.config()

import dotenv from "dotenv";
import mongoose from "mongoose";

// Load environment variables FIRST
dotenv.config();

// Import app
import app from "./app.js";

const PORT = process.env.PORT || 3000;

// ============================================
// Connect to MongoDB & Start Server
// ============================================

const startServer = async () => {
  try {
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
      throw new Error("MONGO_URL is not defined in environment variables");
    }

    await mongoose.connect(mongoUrl);
    console.log("✅ MongoDB Connected!");
app.use('/auth', authRoutes);

app.get("/", (req, res) => {
  res.send("Server is running!");
});
connectDB()

    // Start server
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`✅ Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err.message);
  // Close server & exit process
  mongoose.connection.close(() => {
    process.exit(1);
  });
});
