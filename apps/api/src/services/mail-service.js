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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function nl2br(value) {
  return escapeHtml(value).replace(/\n/g, "<br />");
}

export function isMailConfigured() {
  return Boolean(getTransporter());
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

export async function sendInviteEmail({ to, projectName, role, acceptUrl }) {
  const transporter = getTransporter();

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h2 style="margin: 0 0 12px;">You've been invited to a FeedSpace project</h2>
      <p style="margin: 0 0 8px;">You've been added as a <strong>${role}</strong> on the project <strong>${projectName}</strong>.</p>
      <p style="margin: 0 0 16px;">Click the link below to accept the invitation and access the project:</p>
      <a href="${acceptUrl}" style="display:inline-block;padding:10px 20px;background:#0f766e;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">
        Accept Invitation
      </a>
      <p style="margin: 16px 0 0; font-size: 12px; color: #64748b;">If you did not expect this invitation, you can ignore this email.</p>
    </div>
  `;

  if (!transporter) {
    logger.warn("SMTP is not configured. Invite email not sent.", { to, projectName });
    return;
  }

  await transporter.sendMail({
    from: getFromAddress(),
    to,
    subject: `You've been invited to "${projectName}" on FeedSpace`,
    html
  });
}

export async function sendPortalLinkEmail({ to, subject, body, portalUrl, includePromotion = true }) {
  const transporter = getTransporter();

  if (!transporter) {
    logger.warn("SMTP is not configured. Portal link email not sent.", { to });
    return;
  }

  const promotionBlock = includePromotion
    ? `
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;" />
      <p style="margin:0;font-size:12px;color:#64748b;">
        Powered by FeedSpace. Collect testimonials and customer stories in minutes.
      </p>
    `
    : "";

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <p style="margin:0 0 14px;">${nl2br(body)}</p>
      <p style="margin:0 0 14px;">Share feedback here:</p>
      <p style="margin:0 0 16px;">
        <a href="${escapeHtml(portalUrl)}" style="color:#0f766e;text-decoration:underline;word-break:break-all;">${escapeHtml(portalUrl)}</a>
      </p>
      ${promotionBlock}
    </div>
  `;

  await transporter.sendMail({
    from: getFromAddress(),
    to,
    subject,
    html,
    text: `${body}\n\nShare feedback here:\n${portalUrl}${includePromotion ? "\n\nPowered by FeedSpace. Collect testimonials and customer stories in minutes." : ""}`
  });
}