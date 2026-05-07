import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { errorHandler, notFoundHandler } from "./middlewares/error-middleware.js";
import { apiRouter } from "./routes/index.js";

function buildCorsOrigins() {
  const origins = new Set([env.CLIENT_URL]);
  if (env.CLIENT_URLS) {
    env.CLIENT_URLS.split(",")
      .map((u) => u.trim())
      .filter(Boolean)
      .forEach((u) => origins.add(u));
  }
  return [...origins];
}

export function createApp() {
  const app = express();

  if (env.NODE_ENV === "production") {
    // Required behind proxies on platforms like Render/Fly/Heroku for correct IP handling.
    app.set("trust proxy", 1);
  }

  const allowedOrigins = buildCorsOrigins();

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow server-to-server calls (no origin) and whitelisted origins
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      },
      credentials: true
    })
  );
  app.use(helmet());

  // Stripe webhook requires the raw request body for signature verification.
  // This route must be registered BEFORE express.json() consumes the body.
  app.use("/api/billing/webhook", express.raw({ type: "application/json" }));

  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(
    morgan("combined", {
      stream: {
        write: (message) => logger.info(message.trim())
      }
    })
  );

  app.use("/api", apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

  // Stripe webhook requires the raw request body for signature verification.
  // This route must be registered BEFORE express.json() consumes the body.
  app.use("/api/billing/webhook", express.raw({ type: "application/json" }));

  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(
    morgan("combined", {
      stream: {
        write: (message) => logger.info(message.trim())
      }
    })
  );

  app.use("/api", apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}