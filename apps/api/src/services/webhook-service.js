import crypto from "crypto";
import { ProjectModel } from "../models/project-model.js";
import { WEBHOOK_EVENTS, WebhookModel } from "../models/webhook-model.js";
import { ApiError } from "../utils/api-error.js";
import { logger } from "../config/logger.js";

async function ensureProjectOwnership(userId, projectId) {
  const project = await ProjectModel.findOne({ _id: projectId, userId });
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  return project;
}

export async function listWebhooks(userId, projectId) {
  await ensureProjectOwnership(userId, projectId);
  return WebhookModel.find({ projectId }).sort({ createdAt: -1 }).lean();
}

export async function createWebhook(userId, projectId, { url, events, secret }) {
  await ensureProjectOwnership(userId, projectId);

  if (!events || events.length === 0) {
    throw new ApiError(400, "At least one event must be selected");
  }

  const invalid = events.filter((e) => !WEBHOOK_EVENTS.includes(e));
  if (invalid.length) {
    throw new ApiError(400, `Unknown events: ${invalid.join(", ")}`);
  }

  return WebhookModel.create({
    projectId,
    url,
    events,
    secret: secret || crypto.randomUUID(),
    isActive: true
  });
}

export async function deleteWebhook(userId, projectId, webhookId) {
  await ensureProjectOwnership(userId, projectId);
  const webhook = await WebhookModel.findOne({ _id: webhookId, projectId });
  if (!webhook) throw new ApiError(404, "Webhook not found");
  await webhook.deleteOne();
}

export async function testWebhook(userId, projectId, webhookId) {
  await ensureProjectOwnership(userId, projectId);
  const webhook = await WebhookModel.findOne({ _id: webhookId, projectId });
  if (!webhook) throw new ApiError(404, "Webhook not found");

  const payload = {
    event: "webhook.test",
    timestamp: new Date().toISOString(),
    data: { message: "This is a test delivery from FeedSpace." }
  };

  const result = await deliverWebhook(webhook, payload);
  return result;
}

/**
 * Dispatch a webhook event to all active webhooks for a project listening to that event.
 * Fires and forgets – errors are logged but never thrown so they never break the main flow.
 */
export async function dispatchWebhookEvent(projectId, event, data) {
  try {
    const hooks = await WebhookModel.find({ projectId, events: event, isActive: true }).lean();
    const payload = { event, timestamp: new Date().toISOString(), data };

    await Promise.allSettled(hooks.map((hook) => deliverWebhook(hook, payload)));
  } catch (err) {
    logger.warn(`Webhook dispatch failed for event "${event}": ${err.message}`);
  }
}

async function deliverWebhook(webhook, payload) {
  const body = JSON.stringify(payload);
  const headers = {
    "Content-Type": "application/json",
    "User-Agent": "FeedSpace-Webhook/1.0"
  };

  if (webhook.secret) {
    const sig = crypto.createHmac("sha256", webhook.secret).update(body).digest("hex");
    headers["X-FeedSpace-Signature"] = `sha256=${sig}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(webhook.url, {
      method: "POST",
      headers,
      body,
      signal: controller.signal
    });

    clearTimeout(timeout);
    return { delivered: true, status: response.status, url: webhook.url };
  } catch (err) {
    clearTimeout(timeout);
    logger.warn(`Webhook delivery failed to ${webhook.url}: ${err.message}`);
    return { delivered: false, error: err.message, url: webhook.url };
  }
}
