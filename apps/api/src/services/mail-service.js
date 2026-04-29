import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

let cachedTransporter;

function getTransporter() {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  if (!env.SMTP_HOST || !env.SMTP_PORT || !env.SMTP_USER || !env.SMTP_PASS || !env.SMTP_FROM_EMAIL) {
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  });

  return cachedTransporter;
}

function getFromAddress() {
  const fromName = env.SMTP_FROM_NAME || "FeedSpace";
  return `${fromName} <${env.SMTP_FROM_EMAIL}>`;
}

export async function sendOtpEmail({ to, otp, purpose }) {
  const transporter = getTransporter();

  const subject =
    purpose === "email-verification"
      ? "Verify your FeedSpace email"
      : "FeedSpace password reset code";

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
      <h2 style="margin: 0 0 12px;">FeedSpace Security Code</h2>
      <p style="margin: 0 0 8px;">Your one-time code is:</p>
      <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px; margin: 8px 0 16px;">${otp}</p>
      <p style="margin: 0 0 8px;">This code expires shortly. Do not share it with anyone.</p>
      <p style="margin: 0; font-size: 12px; color: #64748b;">If you did not request this, you can ignore this email.</p>
    </div>
  `;

  if (!transporter) {
    logger.warn("SMTP is not configured. OTP email not sent.", { to, purpose, otp });
    return;
  }

  await transporter.sendMail({
    from: getFromAddress(),
    to,
    subject,
    html
  });
}