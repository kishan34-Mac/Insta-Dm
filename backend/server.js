import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import env from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import instagramRoutes from "./routes/instagram.routes.js";
import { errorHandler } from "./utils/errorHandler.js";

const app = express();

app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/health", (req, res) => res.status(200).json({ success: true, message: "Server is healthy" }));
app.use("/auth", authRoutes);
app.use("/auth/instagram", instagramRoutes);

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    console.log("MongoDB connected");

    app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
      console.log(`Environment: ${env.nodeEnv}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err && err.message ? err.message : err);
  mongoose.connection.close(() => process.exit(1));
});
