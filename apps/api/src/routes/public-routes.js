import { Router } from "express";
import { feed, trackOpen } from "../controllers/public-controller.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.get("/:slug/feedback", asyncHandler(feed));
router.post("/:slug/track-open", asyncHandler(trackOpen));

export { router as publicRouter };