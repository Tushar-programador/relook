import { z } from "zod";
import {
  cancelSubscription,
  createCheckoutSession,
  getSubscription,
  handleWebhook
} from "../services/billing-service.js";
import { sendSuccess } from "../utils/api-response.js";

export const checkoutSchema = z.object({
  plan: z.enum(["pro", "business"]),
  successUrl: z.string().url(),
  cancelUrl: z.string().url()
});

export async function subscription(req, res) {
  const data = await getSubscription(req.user._id);
  return sendSuccess(res, data);
}

export async function checkout(req, res) {
  const data = await createCheckoutSession(
    req.user._id,
    req.body.plan,
    req.body.successUrl,
    req.body.cancelUrl
  );
  return sendSuccess(res, data);
}

// Receives raw body — registered separately in app.js before express.json()
export async function webhook(req, res) {
  const sig = req.headers["stripe-signature"];
  const data = await handleWebhook(req.body, sig);
  return sendSuccess(res, data);
}

export async function cancel(req, res) {
  const data = await cancelSubscription(req.user._id);
  return sendSuccess(res, data);
}
