import { z } from "zod";
import { WEBHOOK_EVENTS } from "../models/webhook-model.js";
import { createWebhook, deleteWebhook, listWebhooks, testWebhook } from "../services/webhook-service.js";
import { sendSuccess } from "../utils/api-response.js";

export const createWebhookSchema = z.object({
  url: z.string().url("Webhook URL must be a valid URL"),
  events: z.array(z.enum(WEBHOOK_EVENTS)).min(1, "Select at least one event"),
  secret: z.string().optional()
});

export async function list(req, res) {
  const data = await listWebhooks(req.user._id, req.params.projectId);
  return sendSuccess(res, data);
}

export async function create(req, res) {
  const data = await createWebhook(req.user._id, req.params.projectId, req.body);
  return sendSuccess(res, data, 201);
}

export async function remove(req, res) {
  await deleteWebhook(req.user._id, req.params.projectId, req.params.webhookId);
  return sendSuccess(res, { deleted: true });
}

export async function test(req, res) {
  const data = await testWebhook(req.user._id, req.params.projectId, req.params.webhookId);
  return sendSuccess(res, data);
}
