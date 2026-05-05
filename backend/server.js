import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import env from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import instagramRoutes from "./routes/instagram.routes.js";
import campaignRoutes from "./routes/campaign.routes.js";
import { errorHandler } from "./utils/errorHandler.js";

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/health", (req, res) => res.status(200).json({ success: true, message: "Server is healthy" }));
app.use("/auth", authRoutes);
app.use("/auth/instagram", instagramRoutes);
app.use("/campaigns", campaignRoutes);

app.use(errorHandler);



  const server = app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`);
     
  });
  const startServer = async () => {
  try {
    await connectDB();
    console.log("✅MongoDB connected");
  } catch (err) {
    console.warn("Failed to connect to MongoDB. Server will start in mock mode for UI testing.");
    console.warn("❌Error:", err.message);
  }

  server.on("error", (err) => {
    console.error("Server error:", err);
  });
};

startServer();

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err && err.message ? err.message : err);
  // Do not exit process in mock mode
});
