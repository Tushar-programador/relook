import { Router } from "express";
import { highlights, sentiment, summarize } from "../controllers/ai-controller.js";
import { requireAuth } from "../middlewares/auth-middleware.js";
import { requirePlan } from "../middlewares/require-plan-middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.use(requireAuth, requirePlan("business"));

router.get("/projects/:projectId/summarize", asyncHandler(summarize));
router.get("/projects/:projectId/highlights", asyncHandler(highlights));
router.get("/projects/:projectId/sentiment", asyncHandler(sentiment));

export { router as aiRouter };
