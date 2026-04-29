import { Router } from "express";
import { feed } from "../controllers/public-controller.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.get("/:slug/feedback", asyncHandler(feed));

export { router as publicRouter };