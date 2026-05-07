import { z } from "zod";
import {
  loginUser,
  registerUser,
  resendVerificationOtp,
  resetPasswordWithOtp,
  sendForgotPasswordOtp,
  verifyEmailOtp
} from "../services/auth-service.js";
import { sendSuccess } from "../utils/api-response.js";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be at most 50 characters").trim(),
    email: z.email(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

export const authSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export const emailSchema = z.object({
  email: z.email()
});

export const verifyOtpSchema = z.object({
  email: z.email(),
  otp: z.string().length(6, "OTP must be 6 digits")
});

export const resetPasswordSchema = z.object({
  email: z.email(),
  otp: z.string().length(6, "OTP must be 6 digits"),
  newPassword: z.string().min(8, "Password must be at least 8 characters")
});

export async function register(req, res) {
  const result = await registerUser(req.body);
  return sendSuccess(res, result, 201);
}

export async function login(req, res) {
  const result = await loginUser(req.body);
  return sendSuccess(res, result);
}

export async function me(req, res) {
  return sendSuccess(res, req.user);
}

export async function resendVerification(req, res) {
  const data = await resendVerificationOtp(req.body);
  return sendSuccess(res, data);
}

export async function verifyEmail(req, res) {
  const data = await verifyEmailOtp(req.body);
  return sendSuccess(res, data);
}

export async function forgotPassword(req, res) {
  const data = await sendForgotPasswordOtp(req.body);
  return sendSuccess(res, data);
}

export async function resetPassword(req, res) {
  const data = await resetPasswordWithOtp(req.body);
  return sendSuccess(res, data);
}