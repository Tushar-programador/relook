import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { UserModel } from "../models/user-model.js";
import { ApiError } from "../utils/api-error.js";

export async function requireAuth(req, _res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return next(new ApiError(401, "Authentication required"));
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await UserModel.findById(payload.sub);
    if (!user) {
      return next(new ApiError(401, "Invalid token"));
    }

    req.user = user;
    next();
  } catch (_error) {
    next(new ApiError(401, "Invalid token"));
  }
}