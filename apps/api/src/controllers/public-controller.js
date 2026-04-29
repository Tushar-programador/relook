import { getApprovedFeedback } from "../services/feedback-service.js";
import { sendSuccess } from "../utils/api-response.js";

export async function feed(req, res) {
  const data = await getApprovedFeedback(req.params.slug);
  return sendSuccess(res, data);
}