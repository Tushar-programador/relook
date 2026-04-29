import { z } from "zod";
import {
  deleteFeedback,
  listFeedback,
  submitFeedback,
  updateFeedbackStatus
} from "../services/feedback-service.js";
import { sendSuccess } from "../utils/api-response.js";

export const createFeedbackSchema = z
  .object({
    type: z.enum(["video", "audio", "text"]),
    mediaUrl: z.union([z.url(), z.literal("")]).optional(),
    thumbnailUrl: z.union([z.url(), z.literal("")]).optional(),
    message: z.string().max(1000).optional(),
    name: z.string().max(100).optional(),
    email: z.union([z.email(), z.literal("")]).optional(),
    metadata: z
      .object({
        durationSeconds: z.number().nonnegative().optional(),
        mimeType: z.string().optional()
      })
      .optional()
  })
  .superRefine((value, ctx) => {
    if (value.type === "text" && !value.message?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["message"],
        message: "Message is required for text feedback"
      });
    }

    if (value.type !== "text" && !value.mediaUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["mediaUrl"],
        message: "mediaUrl is required for audio and video feedback"
      });
    }
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
  const query = req.validated?.query || req.query;
  const data = await listFeedback(req.user._id, req.params.projectId, query);
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