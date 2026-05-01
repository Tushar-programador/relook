import { Router } from "express";
import {
	authSchema,
	emailSchema,
	forgotPassword,
	login,
	me,
	register,
	registerSchema,
	resendVerification,
	resetPassword,
	resetPasswordSchema,
	verifyEmail,
	verifyOtpSchema
} from "../controllers/auth-controller.js";
import { requireAuth } from "../middlewares/auth-middleware.js";
import { validate } from "../middlewares/validate-middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.post("/register", validate(registerSchema), asyncHandler(register));
router.post("/login", validate(authSchema), asyncHandler(login));
router.post("/verify-email", validate(verifyOtpSchema), asyncHandler(verifyEmail));
router.post("/resend-verification", validate(emailSchema), asyncHandler(resendVerification));
router.post("/forgot-password", validate(emailSchema), asyncHandler(forgotPassword));
router.post("/reset-password", validate(resetPasswordSchema), asyncHandler(resetPassword));
router.get("/me", requireAuth, asyncHandler(me));

export { router as authRouter };