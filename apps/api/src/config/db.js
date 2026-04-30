import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "./logger.js";

async function connect(uri, label) {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000
  });

  logger.info("MongoDB connected", { mode: label });
}

export async function connectToDatabase() {
  mongoose.set("strictQuery", true);
  logger.info("Connecting to MongoDB");

  try {
    await connect(env.MONGODB_URI, "primary");
  } catch (error) {
    const canTryFallback =
      env.MONGODB_URI.startsWith("mongodb+srv://") &&
      !!env.MONGODB_URI_FALLBACK &&
      /(querySrv|ENOTFOUND|ECONNREFUSED|ETIMEOUT)/i.test(error?.message || "");

    if (!canTryFallback) {
      throw error;
    }

    logger.warn("Primary MongoDB URI failed, trying fallback URI", {
      reason: error.message
    });

    await connect(env.MONGODB_URI_FALLBACK, "fallback");
  }
}