import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { errorHandler, notFoundHandler } from "./middlewares/error-middleware.js";
import { apiRouter } from "./routes/index.js";

export function createApp() {
  const app = express();
  const allowedOrigins = [
    env.CLIENT_URL,
    ...(env.CLIENT_URLS || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  ];

  if (env.NODE_ENV === "production") {
    // Required behind proxies on platforms like Render/Fly/Heroku for correct IP handling.
    app.set("trust proxy", 1);
  }

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
      },
      credentials: false
    })
  );
  app.use(helmet());
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