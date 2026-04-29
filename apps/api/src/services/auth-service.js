import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { UserModel } from "../models/user-model.js";
import { ApiError } from "../utils/api-error.js";

function signToken(userId) {
  return jwt.sign({}, env.JWT_SECRET, {
    subject: String(userId),
    expiresIn: env.JWT_EXPIRES_IN
  });
}

export async function registerUser({ email, password }) {
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "Email already in use");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await UserModel.create({ email, passwordHash });

  return {
    user,
    token: signToken(user._id)
  };
}

export async function loginUser({ email, password }) {
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  return {
    user,
    token: signToken(user._id)
  };
}