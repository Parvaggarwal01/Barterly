import express from "express";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import cookieParser from "cookie-parser";

// Import models (register with Mongoose early)
import "./models/User.model.js";
import "./models/Category.model.js";
import "./models/Skill.model.js";
import "./models/Review.model.js";
import "./models/BarterRequest.model.js";
import "./models/Bookmark.model.js";
import "./models/Report.model.js";

// Import routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import skillRoutes from "./routes/skill.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import barterRoutes from "./routes/barter.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import bookmarkRoutes from "./routes/bookmark.routes.js";
import reportRoutes from "./routes/report.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import adminRoutes from "./routes/admin.routes.js";

// Import middlewares
import {
  errorHandler,
  notFound,
} from "./middlewares/errorHandler.middleware.js";
import { mongoSanitizeMiddleware } from "./middlewares/mongoSanitize.middleware.js";

//Import Rate Limiters
import { authLimiter, apiLimiter } from "./config/rateLimiter.js";

import { client } from "./config/metrics.js";
import metricsMiddleware from "./middlewares/metrics.middleware.js";

const app = express();

app.use(metricsMiddleware);

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

// ============ SECURITY MIDDLEWARE ============

// Helmet - Set security HTTP headers
app.use(helmet());

// CORS - Cross-Origin Resource Sharing
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://localhost:3000",
  "https://white-mushroom-0e2ffb300.5.azurestaticapps.net", // Add potential azure static web apps domains if known, or just rely on FRONTEND_URL
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      // In production/Azure we want to be permissive if FRONTEND_URL isn't perfectly matched during setup
      // A more robust approach checks if origin is in the allowed list, OR if it's a completely open environment variable
      if (
        allowedOrigins.includes(origin) ||
        process.env.NODE_ENV !== "production"
      ) {
        callback(null, true);
      } else if (process.env.ALLOW_ALL_CORS === "true") {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parser
app.use(cookieParser());

// Data sanitization against NoSQL query injection
// Custom middleware for Express 5 compatibility
app.use(mongoSanitizeMiddleware);

// Prevent HTTP Parameter Pollution
app.use(hpp());

// ============ ROUTES ============

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", apiLimiter, userRoutes);
app.use("/api/skills", apiLimiter, skillRoutes);
app.use("/api/categories", apiLimiter, categoryRoutes);
app.use("/api/barters", apiLimiter, barterRoutes);
app.use("/api/reviews", apiLimiter, reviewRoutes);
app.use("/api/bookmarks", apiLimiter, bookmarkRoutes);
app.use("/api/reports", apiLimiter, reportRoutes);
app.use("/api/notifications", apiLimiter, notificationRoutes);
app.use("/api/chat", apiLimiter, chatRoutes);
app.use("/api/admin", apiLimiter, adminRoutes);

// ============ ERROR HANDLING ============

// Handle 404 - Route not found
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;
