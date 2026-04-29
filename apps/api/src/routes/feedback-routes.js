import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  createFeedbackSchema,
  feedbackStatusSchema,
  list,
  listFeedbackQuerySchema,
  remove,
  submit,
  updateStatus
} from "../controllers/feedback-controller.js";
import { requireAuth } from "../middlewares/auth-middleware.js";
import { validate } from "../middlewares/validate-middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

const feedbackSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    error: {
      message: "Too many feedback submissions. Please try again later."
    }
  }
});

router.post("/:slug", feedbackSubmissionLimiter, validate(createFeedbackSchema), asyncHandler(submit));
router.get("/project/:projectId", requireAuth, validate(listFeedbackQuerySchema, "query"), asyncHandler(list));
router.patch("/:id/status", requireAuth, validate(feedbackStatusSchema), asyncHandler(updateStatus));
router.delete("/:id", requireAuth, asyncHandler(remove));

export { router as feedbackRouter };