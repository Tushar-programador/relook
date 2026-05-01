import { analyzeSentiment, extractHighlights, summarizeFeedback } from "../services/ai-service.js";
import { sendSuccess } from "../utils/api-response.js";

export async function summarize(req, res) {
  const data = await summarizeFeedback(req.user._id, req.params.projectId);
  return sendSuccess(res, data);
}

export async function highlights(req, res) {
  const data = await extractHighlights(req.user._id, req.params.projectId);
  return sendSuccess(res, data);
}

export async function sentiment(req, res) {
  const data = await analyzeSentiment(req.user._id, req.params.projectId);
  return sendSuccess(res, data);
}
