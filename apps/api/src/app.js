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

  app.use(
    cors({
      origin: env.CLIENT_URL,
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