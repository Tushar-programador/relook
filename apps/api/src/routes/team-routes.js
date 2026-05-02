import { Router } from "express";
import { invite, inviteSchema, list, remove } from "../controllers/team-controller.js";
import { requireAuth } from "../middlewares/auth-middleware.js";
import { requirePlan } from "../middlewares/require-plan-middleware.js";
import { validate } from "../middlewares/validate-middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router({ mergeParams: true });

// All team management requires business plan
router.get("/", requireAuth, requirePlan("business"), asyncHandler(list));
router.post("/invite", requireAuth, requirePlan("business"), validate(inviteSchema), asyncHandler(invite));
router.delete("/:memberId", requireAuth, requirePlan("business"), asyncHandler(remove));

export { router as teamRouter };
