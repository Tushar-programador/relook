import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

function makeRateLimiter({ windowMs, limit, message }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      data: null,
      error: { message }
    }
  });
}

export const sendPortalLinkLimiter = rateLimit({
  windowMs: env.SEND_PORTAL_LINK_RATE_LIMIT_WINDOW_MS,
  limit: env.SEND_PORTAL_LINK_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => String(req.user?._id || req.ip),
  message: {
    success: false,
    data: null,
    error: {
      message: "Too many email send requests. Please try again shortly."
    }
  }
});

// Auth endpoint limiters
export const loginLimiter = makeRateLimiter({
  windowMs: env.LOGIN_RATE_LIMIT_WINDOW_MS,
  limit: env.LOGIN_RATE_LIMIT_MAX,
  message: "Too many login attempts. Please try again later."
});

export const registerLimiter = makeRateLimiter({
  windowMs: env.REGISTER_RATE_LIMIT_WINDOW_MS,
  limit: env.REGISTER_RATE_LIMIT_MAX,
  message: "Too many registration attempts. Please try again later."
});

export const otpLimiter = makeRateLimiter({
  windowMs: env.OTP_RATE_LIMIT_WINDOW_MS,
  limit: env.OTP_RATE_LIMIT_MAX,
  message: "Too many OTP requests. Please try again later."
});

// Upload endpoint limiter
export const uploadLimiter = makeRateLimiter({
  windowMs: env.UPLOAD_RATE_LIMIT_WINDOW_MS,
  limit: env.UPLOAD_RATE_LIMIT_MAX,
  message: "Too many upload requests. Please try again later."
});

// AI endpoint limiter
export const aiLimiter = makeRateLimiter({
  windowMs: env.AI_RATE_LIMIT_WINDOW_MS,
  limit: env.AI_RATE_LIMIT_MAX,
  message: "Too many AI requests. Please try again later."
});
