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