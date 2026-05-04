import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

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
