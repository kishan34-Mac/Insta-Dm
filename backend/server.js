import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import env from "./config/env.js";

import authRoutes from "./routes/auth.routes.js";
import campaignRoutes from "./routes/campaign.routes.js";
import instagramRoutes from "./routes/instagram.routes.js";

import { errorHandler } from "./utils/errorHandler.js";

/* ==========================================
   APP
========================================== */

const app = express();

/* ==========================================
   TRUST PROXY
========================================== */

app.set("trust proxy", 1);

/* ==========================================
   CORS
========================================== */

const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:5173",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without origin
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error("CORS policy violation")
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

/* ==========================================
   BODY PARSER
========================================== */

app.use(
  express.json({
    limit: "5mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

/* ==========================================
   COOKIES
========================================== */

app.use(cookieParser());

/* ==========================================
   ROOT
========================================== */

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Athenura API running 🚀",
  });
});

/* ==========================================
   HEALTH CHECK
========================================== */

app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Server healthy",
    environment: env.nodeEnv,
    timestamp: new Date(),
  });
});

/* ==========================================
   API ROUTES
========================================== */

app.use("/api/auth", authRoutes);

app.use("/api/campaigns", campaignRoutes);

app.use("/api/instagram", instagramRoutes);

/* ==========================================
   404 HANDLER
========================================== */

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl,
  });
});

/* ==========================================
   GLOBAL ERROR HANDLER
========================================== */

app.use(errorHandler);

/* ==========================================
   START SERVER
========================================== */

const startServer = async () => {
  try {
    await connectDB();

    console.log("✅ MongoDB connected");

    const server = app.listen(
      env.port,
      () => {
        console.log(`
🌍 Environment : ${env.nodeEnv}
📡 Port        : ${env.port}
🔗 URL         : http://localhost:${env.port}
        `);
      }
    );

    server.on("error", (err) => {
      console.error(
        "❌ Server Error:",
        err
      );
    });
  } catch (err) {
    console.error(
      "❌ MongoDB Connection Failed:",
      err.message
    );

    process.exit(1);
  }
};

startServer();

/* ==========================================
   UNHANDLED REJECTIONS
========================================== */

process.on(
  "unhandledRejection",
  (err) => {
    console.error(
      "❌ Unhandled Rejection:",
      err?.message || err
    );
  }
);

/* ==========================================
   UNCAUGHT EXCEPTIONS
========================================== */

process.on(
  "uncaughtException",
  (err) => {
    console.error(
      "❌ Uncaught Exception:",
      err?.message || err
    );

    process.exit(1);
  }
);