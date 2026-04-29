import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { UserModel } from "../models/user-model.js";
import { ApiError } from "../utils/api-error.js";
import { sendOtpEmail } from "./mail-service.js";

function signToken(userId) {
  return jwt.sign({}, env.JWT_SECRET, {
    subject: String(userId),
    expiresIn: env.JWT_EXPIRES_IN
  });
}

function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function setAndSendOtp(user, purpose) {
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + env.OTP_EXPIRES_MINUTES * 60 * 1000);

  user.otp = {
    codeHash: hashOtp(otp),
    expiresAt,
    purpose
  };
  await user.save();

  await sendOtpEmail({
    to: user.email,
    otp,
    purpose
  });

  return expiresAt;
}

export async function registerUser({ email, password }) {
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "Email already in use");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await UserModel.create({ email, passwordHash });
  await setAndSendOtp(user, "email-verification");

  return {
    user,
    verificationRequired: true
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

  if (!user.isEmailVerified) {
    throw new ApiError(403, "Please verify your email before logging in");
  }

  return {
    user,
    token: signToken(user._id)
  };
}

export async function resendVerificationOtp({ email }) {
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isEmailVerified) {
    throw new ApiError(400, "Email is already verified");
  }

  const expiresAt = await setAndSendOtp(user, "email-verification");

  return {
    message: "Verification code sent",
    expiresAt
  };
}

export async function verifyEmailOtp({ email, otp }) {
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isEmailVerified) {
    return {
      message: "Email already verified"
    };
  }

  if (!user.otp?.codeHash || user.otp.purpose !== "email-verification" || !user.otp.expiresAt) {
    throw new ApiError(400, "No verification code found. Request a new code.");
  }

  if (new Date(user.otp.expiresAt).getTime() < Date.now()) {
    throw new ApiError(400, "Verification code expired");
  }

  if (hashOtp(otp) !== user.otp.codeHash) {
    throw new ApiError(400, "Invalid verification code");
  }

  user.isEmailVerified = true;
  user.otp = {
    codeHash: "",
    expiresAt: null,
    purpose: ""
  };
  await user.save();

  return {
    message: "Email verified successfully"
  };
}

export async function sendForgotPasswordOtp({ email }) {
  const user = await UserModel.findOne({ email });
  if (!user) {
    return {
      message: "If this email exists, a reset code was sent"
    };
  }

  await setAndSendOtp(user, "password-reset");

  return {
    message: "If this email exists, a reset code was sent"
  };
}

export async function resetPasswordWithOtp({ email, otp, newPassword }) {
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new ApiError(400, "Invalid email or code");
  }

  if (!user.otp?.codeHash || user.otp.purpose !== "password-reset" || !user.otp.expiresAt) {
    throw new ApiError(400, "No reset code found. Request a new code.");
  }

  if (new Date(user.otp.expiresAt).getTime() < Date.now()) {
    throw new ApiError(400, "Reset code expired");
  }

  if (hashOtp(otp) !== user.otp.codeHash) {
    throw new ApiError(400, "Invalid reset code");
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  user.otp = {
    codeHash: "",
    expiresAt: null,
    purpose: ""
  };

  await user.save();

  return {
    message: "Password reset successful"
  };
}