import { z } from "zod";
import { loginUser, registerUser } from "../services/auth-service.js";
import { sendSuccess } from "../utils/api-response.js";

export const authSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 characters")
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