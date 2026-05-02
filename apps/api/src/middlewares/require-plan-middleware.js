import { ApiError } from "../utils/api-error.js";

const PLAN_TIER = { free: 0, pro: 1, business: 2 };

/**
 * Middleware factory that requires the authenticated user to be on a minimum plan.
 * Must be used after requireAuth.
 * @param {"pro" | "business"} minPlan
 */
export function requirePlan(minPlan) {
  return (req, _res, next) => {
    const userTier = PLAN_TIER[req.user?.plan] ?? 0;
    const requiredTier = PLAN_TIER[minPlan] ?? 0;

    if (userTier < requiredTier) {
      return next(
        new ApiError(403, `This feature requires the ${minPlan} plan or higher. Upgrade at /pricing.`)
      );
    }

    next();
  };
}
