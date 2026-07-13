import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xssSanitize from "./middleware/xss.middleware.js";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import env from "./config/env.js";
import { initSocket } from "./services/socket.service.js";
import { verifyAccessToken } from "./utils/jwt.js";

import authRoutes from "./routes/auth.routes.js";
import campaignRoutes from "./routes/campaign.routes.js";
import leadRoutes from "./routes/lead.routes.js";
import instagramRoutes from "./routes/instagram.routes.js";
import overviewRoutes from "./routes/overview.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import billingRoutes from "./routes/billing.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { handleRazorpayWebhook } from "./controllers/billing.controller.js";

import { errorHandler } from "./utils/errorHandler.js";

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

const parsedCorsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean)
  : [];

const allowedOrigins = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  env.FRONTEND_URL,
  ...parsedCorsOrigins,
].filter(Boolean);

// Security Headers (Helmet with CSP)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://*.instagram.com", "https://*.cdninstagram.com", "https://*.fbcdn.net"],
        connectSrc: ["'self'", "https://*.instagram.com", "https://*.facebook.com", "https://*.fbcdn.net"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Data Sanitization
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xssSanitize()); // Prevent XSS attacks

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: process.env.NODE_ENV === "development" ? 2000 : 200, // relaxed in dev / webhook environments
  standardHeaders: true, 
  legacyHeaders: false, 
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
});

app.use("/api", limiter);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (
        allowedOrigins.includes(origin) ||
        origin.includes("ngrok") ||
        (process.env.NODE_ENV !== "production" && origin.includes("localhost"))
      ) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
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
      "Cookie",
    ],
  })
);

app.options(/.*/, cors());

// Razorpay webhook raw body handler (must run BEFORE express.json())
app.post(
  "/api/v1/billing/razorpay/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => handleRazorpayWebhook(req, res)
);

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

app.use(cookieParser());

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "DMPilot API running 🚀",
  });
});

app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Server healthy",
    environment: env.NODE_ENV,
    timestamp: new Date(),
  });
});

// ----------------------------------------------------
// UNIFIED WEBHOOK FORWARDING
// Forward root /webhook to instagramRoutes sub-router
// ----------------------------------------------------
app.get("/webhook", (req, res, next) => {
  req.url = "/webhook";
  instagramRoutes(req, res, next);
});

app.post("/webhook", (req, res, next) => {
  req.url = "/webhook";
  instagramRoutes(req, res, next);
});

// ----------------------------------------------------
// REGISTER API ROUTES
// ----------------------------------------------------
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/campaigns", campaignRoutes);
app.use("/api/v1/leads", leadRoutes);
app.use("/api/v1/instagram", instagramRoutes);
app.use("/api/v1/overview", overviewRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/billing", billingRoutes);
app.use("/api/v1/admin", adminRoutes);

// Swagger Documentation Route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((req, res) => {
  console.warn("[404]", req.method, req.originalUrl);
  return res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});


import { seedAdminUser } from "./utils/seedAdmin.js";

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();

    console.log("✅ MongoDB connected");
    await seedAdminUser();

    const server = app.listen(env.PORT, () => {
      console.log(`
🚀 Server Running
🌍 Environment : ${env.NODE_ENV}
📡 Port        : ${env.PORT}
🔗 URL         : http://localhost:${env.PORT}
      `);
    });

    server.on("error", (err) => {
      console.error("❌ Server Error:", err);
    });

    // Initialize Socket.io Server with proper CORS configuration matching allowed origins
    const io = new Server(server, {
      cors: {
        origin: (origin, callback) => {
          if (
            !origin ||
            allowedOrigins.includes(origin) ||
            origin.includes("ngrok") ||
            (process.env.NODE_ENV !== "production" && origin.includes("localhost"))
          ) {
            return callback(null, true);
          }
          return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
      }
    });

    // Socket.io JWT Authentication Middleware
    io.use((socket, next) => {
      try {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];
        if (!token) {
          console.warn(`🔌 [Socket.io Middleware] Auth failed: Token not provided by connection ${socket.id}`);
          return next(new Error("Authentication error: Token missing"));
        }

        const decoded = verifyAccessToken(token);
        if (!decoded || !decoded.userId) {
          console.warn(`🔌 [Socket.io Middleware] Auth failed: Token invalid or userId missing`);
          return next(new Error("Authentication error: Invalid session"));
        }

        socket.userId = decoded.userId;
        next();
      } catch (error) {
        console.error("🔌 [Socket.io Middleware] Exception verifying token:", error.message);
        return next(new Error("Authentication error: Invalid session"));
      }
    });

    // Connection handler
    io.on("connection", (socket) => {
      const userRoom = `user:${socket.userId}`;
      socket.join(userRoom);
      console.log(`🔌 [Socket.io] User '${socket.userId}' connected on socket '${socket.id}', joined room '${userRoom}'`);

      socket.on("disconnect", (reason) => {
        console.log(`🔌 [Socket.io] Socket '${socket.id}' disconnected. Reason: ${reason}`);
      });
    });

    // Initialize the socket service with this io instance
    initSocket(io);
  } catch (err) {
    console.error(
      "❌ MongoDB Connection Failed:",
      err.message
    );

    process.exit(1);
  }
};

startServer();

process.on("unhandledRejection", (err) => {
  console.error(
    "❌ Unhandled Rejection:",
    err?.message || err
  );
});

process.on("uncaughtException", (err) => {
  console.error(
    "❌ Uncaught Exception:",
    err?.message || err
  );

  process.exit(1);
});