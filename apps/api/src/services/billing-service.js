import Stripe from "stripe";
import { UserModel } from "../models/user-model.js";
import { ApiError } from "../utils/api-error.js";
import { env } from "../config/env.js";

function getStripe() {
  if (!env.STRIPE_SECRET_KEY) {
    throw new ApiError(503, "Billing is not configured. Set STRIPE_SECRET_KEY in your environment.");
  }
  return new Stripe(env.STRIPE_SECRET_KEY);
}

function getPriceId(planKey) {
  const map = { pro: env.STRIPE_PRO_PRICE_ID, business: env.STRIPE_BUSINESS_PRICE_ID };
  const priceId = map[planKey];
  if (!priceId) {
    throw new ApiError(503, `Stripe price ID for "${planKey}" plan is not configured`);
  }
  return priceId;
}

export async function getSubscription(userId) {
  const user = await UserModel.findById(userId).lean();
  if (!user) throw new ApiError(404, "User not found");

  return {
    plan: user.plan,
    stripeCustomerId: user.stripeCustomerId || null,
    stripeSubscriptionId: user.stripeSubscriptionId || null
  };
}

export async function createCheckoutSession(userId, planKey, successUrl, cancelUrl) {
  if (!["pro", "business"].includes(planKey)) {
    throw new ApiError(400, "Invalid plan. Choose 'pro' or 'business'");
  }

  const user = await UserModel.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const stripe = getStripe();
  const priceId = getPriceId(planKey);

  const sessionParams = {
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: String(userId),
    metadata: { userId: String(userId), plan: planKey }
  };

  if (user.stripeCustomerId) {
    sessionParams.customer = user.stripeCustomerId;
  } else {
    sessionParams.customer_email = user.email;
  }

  const session = await stripe.checkout.sessions.create(sessionParams);
  return { url: session.url, sessionId: session.id };
}

export async function handleWebhook(rawBody, signature) {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new ApiError(503, "Stripe webhook secret is not configured");
  }

  const stripe = getStripe();
  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    throw new ApiError(400, `Webhook signature verification failed: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan;
    if (userId && plan) {
      await UserModel.findByIdAndUpdate(userId, {
        plan,
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription
      });
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    if (subscription.id) {
      await UserModel.findOneAndUpdate(
        { stripeSubscriptionId: subscription.id },
        { plan: "free", stripeSubscriptionId: "" }
      );
    }
  }

  return { received: true };
}

export async function cancelSubscription(userId) {
  const user = await UserModel.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  if (!user.stripeSubscriptionId) {
    throw new ApiError(400, "No active subscription found to cancel");
  }

  const stripe = getStripe();
  await stripe.subscriptions.cancel(user.stripeSubscriptionId);

  user.plan = "free";
  user.stripeSubscriptionId = "";
  await user.save();

  return { cancelled: true };
}
