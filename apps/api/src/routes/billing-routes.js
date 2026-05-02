import { Router } from "express";
import { cancel, checkout, checkoutSchema, subscription, webhook } from "../controllers/billing-controller.js";
import { requireAuth } from "../middlewares/auth-middleware.js";
import { validate } from "../middlewares/validate-middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

// Stripe webhook: raw body is applied in app.js before express.json()
router.post("/webhook", asyncHandler(webhook));

router.use(requireAuth);
router.get("/subscription", asyncHandler(subscription));
router.post("/checkout", validate(checkoutSchema), asyncHandler(checkout));
router.post("/cancel", asyncHandler(cancel));

export { router as billingRouter };
