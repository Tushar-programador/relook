import { Router } from "express";
import { authSchema, login, me, register } from "../controllers/auth-controller.js";
import { requireAuth } from "../middlewares/auth-middleware.js";
import { validate } from "../middlewares/validate-middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.post("/register", validate(authSchema), asyncHandler(register));
router.post("/login", validate(authSchema), asyncHandler(login));
router.get("/me", requireAuth, asyncHandler(me));

export { router as authRouter };