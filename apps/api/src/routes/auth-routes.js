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
import { loginLimiter, otpLimiter, registerLimiter } from "../middlewares/rate-limit-middleware.js";
import { validate } from "../middlewares/validate-middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.post("/register", registerLimiter, validate(registerSchema), asyncHandler(register));
router.post("/login", loginLimiter, validate(authSchema), asyncHandler(login));
router.post("/verify-email", otpLimiter, validate(verifyOtpSchema), asyncHandler(verifyEmail));
router.post("/resend-verification", otpLimiter, validate(emailSchema), asyncHandler(resendVerification));
router.post("/forgot-password", otpLimiter, validate(emailSchema), asyncHandler(forgotPassword));
router.post("/reset-password", otpLimiter, validate(resetPasswordSchema), asyncHandler(resetPassword));
router.get("/me", requireAuth, asyncHandler(me));

export { router as authRouter };