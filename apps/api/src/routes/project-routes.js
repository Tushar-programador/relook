import { Router } from "express";
import {
  analytics,
  create,
  createProjectSchema,
  list,
  regenApiKey,
  sendPortalLink,
  sendPortalLinkSchema,
  remove,
  update,
  updateProjectSchema
} from "../controllers/project-controller.js";
import { requireAuth } from "../middlewares/auth-middleware.js";
import { requirePlan } from "../middlewares/require-plan-middleware.js";
import { validate } from "../middlewares/validate-middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import { teamRouter } from "./team-routes.js";
import { webhookRouter } from "./webhook-routes.js";

const router = Router();

router.use(requireAuth);
router.post("/", validate(createProjectSchema), asyncHandler(create));
router.get("/", asyncHandler(list));
router.get("/:id/analytics", asyncHandler(analytics));
router.patch("/:id", validate(updateProjectSchema), asyncHandler(update));
router.delete("/:id", asyncHandler(remove));
router.post("/:id/regen-api-key", requirePlan("business"), asyncHandler(regenApiKey));
router.post("/:id/send-portal-link", validate(sendPortalLinkSchema), asyncHandler(sendPortalLink));

// Nested sub-routers (mergeParams handled in each sub-router)
router.use("/:projectId/team", teamRouter);
router.use("/:projectId/webhooks", webhookRouter);

export { router as projectRouter };