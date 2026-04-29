import { Router } from "express";
import {
  analytics,
  create,
  createProjectSchema,
  list,
  remove,
  update,
  updateProjectSchema
} from "../controllers/project-controller.js";
import { requireAuth } from "../middlewares/auth-middleware.js";
import { validate } from "../middlewares/validate-middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.use(requireAuth);
router.post("/", validate(createProjectSchema), asyncHandler(create));
router.get("/", asyncHandler(list));
router.get("/:id/analytics", asyncHandler(analytics));
router.patch("/:id", validate(updateProjectSchema), asyncHandler(update));
router.delete("/:id", asyncHandler(remove));

export { router as projectRouter };