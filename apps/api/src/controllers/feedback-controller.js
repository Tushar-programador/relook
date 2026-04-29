import { z } from "zod";
import {
  deleteFeedback,
  listFeedback,
  submitFeedback,
  updateFeedbackStatus
} from "../services/feedback-service.js";
import { sendSuccess } from "../utils/api-response.js";

export const createFeedbackSchema = z.object({
  type: z.enum(["video", "audio", "text"]),
  mediaUrl: z.url().optional(),
  thumbnailUrl: z.url().optional(),
  message: z.string().max(1000).optional(),
  name: z.string().max(100).optional(),
  email: z.email().optional(),
  metadata: z
    .object({
      durationSeconds: z.number().nonnegative().optional(),
      mimeType: z.string().optional()
    })
    .optional()
});

export const listFeedbackQuerySchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  type: z.enum(["video", "audio", "text"]).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional()
});

export const feedbackStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"])
});

export async function submit(req, res) {
  const feedback = await submitFeedback(req.params.slug, req.body);
  return sendSuccess(res, feedback, 201);
}

export async function list(req, res) {
  const data = await listFeedback(req.user._id, req.params.projectId, req.query);
  return sendSuccess(res, data);
}

export async function updateStatus(req, res) {
  const feedback = await updateFeedbackStatus(req.user._id, req.params.id, req.body.status);
  return sendSuccess(res, feedback);
}

export async function remove(req, res) {
  await deleteFeedback(req.user._id, req.params.id);
  return sendSuccess(res, { deleted: true });
}