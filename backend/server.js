import express from "express";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express()

const startServer = async () => {
  try {
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
      throw new Error("MONGO_URL is not defined in environment variables");
    }

    await mongoose.connect(mongoUrl);
    console.log("✅ MongoDB Connected!");
    app.use("/auth", authRoutes);

    app.get("/", (req, res) => {
      res.send("Server is running!");
    });
    connectDB();

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
