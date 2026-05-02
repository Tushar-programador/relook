import { Router } from "express";
import { create, createWebhookSchema, list, remove, test } from "../controllers/webhook-controller.js";
import { requireAuth } from "../middlewares/auth-middleware.js";
import { requirePlan } from "../middlewares/require-plan-middleware.js";
import { validate } from "../middlewares/validate-middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router({ mergeParams: true });

router.use(requireAuth, requirePlan("business"));

router.get("/", asyncHandler(list));
router.post("/", validate(createWebhookSchema), asyncHandler(create));
router.delete("/:webhookId", asyncHandler(remove));
router.post("/:webhookId/test", asyncHandler(test));

export { router as webhookRouter };
