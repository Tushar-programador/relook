import { Router } from "express";
import mongoose from "mongoose";
import { aiRouter } from "./ai-routes.js";
import { authRouter } from "./auth-routes.js";
import { billingRouter } from "./billing-routes.js";
import { feedbackRouter } from "./feedback-routes.js";
import { projectRouter } from "./project-routes.js";
import { publicRouter } from "./public-routes.js";
import { uploadRouter } from "./upload-routes.js";
import { v1Router } from "./v1-routes.js";
import { requireAuth } from "../middlewares/auth-middleware.js";
import { acceptInvite } from "../controllers/team-controller.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    success: true,
    data: { status: "ok" },
    error: null
  });
});

router.get("/ready", (_req, res) => {
  const dbState = mongoose.connection.readyState;
  // 1 = connected
  if (dbState !== 1) {
    return res.status(503).json({
      success: false,
      data: { status: "unavailable", db: "disconnected" },
      error: { message: "Database not ready" }
    });
  }
  return res.json({
    success: true,
    data: { status: "ok", db: "connected" },
    error: null
  });
});

router.use("/auth", authRouter);
router.use("/projects", projectRouter);
router.use("/feedback", feedbackRouter);
router.use("/public", publicRouter);
router.use("/uploads", uploadRouter);
router.use("/ai", aiRouter);
router.use("/billing", billingRouter);
router.use("/v1", v1Router);

// Team invite accept – standalone route so the token alone is enough
router.post("/projects/team/accept/:token", requireAuth, asyncHandler(acceptInvite));

export { router as apiRouter };