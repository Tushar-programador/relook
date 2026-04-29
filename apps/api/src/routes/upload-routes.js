import { Router } from "express";
import { publicUploadSchema, sign, signPublic, uploadSchema } from "../controllers/upload-controller.js";
import { requireAuth } from "../middlewares/auth-middleware.js";
import { validate } from "../middlewares/validate-middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.post("/public/sign", validate(publicUploadSchema), asyncHandler(signPublic));
router.post("/sign", requireAuth, validate(uploadSchema), asyncHandler(sign));

export { router as uploadRouter };