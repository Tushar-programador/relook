import { getApprovedFeedback, trackPublicFeedbackOpen } from "../services/feedback-service.js";
import { sendSuccess } from "../utils/api-response.js";

export async function feed(req, res) {
  const data = await getApprovedFeedback(req.params.slug);
  return sendSuccess(res, data);
}

export async function trackOpen(req, res) {
  const visitorId = typeof req.body?.visitorId === "string" ? req.body.visitorId.trim().slice(0, 120) : "";
  const data = await trackPublicFeedbackOpen(req.params.slug, visitorId);
  return sendSuccess(res, data);
}