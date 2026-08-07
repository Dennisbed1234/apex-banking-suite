import express from "express";
import cors from "cors";
import helmet from "helmet";
import { generalApiLimiter } from "./middleware/rateLimiters";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

import authRoutes from "./routes/authRoutes";
import customerRoutes from "./routes/customerRoutes";
import adminRoutes from "./routes/adminRoutes";
import chatbotRoutes from "./routes/chatbotRoutes";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(generalApiLimiter);

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", bank: process.env.BANK_NAME || "FirstDemo Bank", fictional: true });
  });

  // Silence favicon and apple-touch-icon 404 noise in production logs
  app.get("/favicon.ico", (req, res) => res.status(204).end());
  app.get("/apple-touch-icon.png", (req, res) => res.status(204).end());
  app.get("/apple-touch-icon-precomposed.png", (req, res) => res.status(204).end());

  app.use("/api/auth", authRoutes);
  app.use("/api/customer", customerRoutes);
  // Admin routes are mounted here but never linked from any public frontend
  // navigation; the frontend serves them only at /secure-admin-login.
  app.use("/api/admin", adminRoutes);
  app.use("/api/chatbot", chatbotRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
