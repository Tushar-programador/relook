import { Router } from "express";
import { FeedbackModel } from "../models/feedback-model.js";
import { ProjectModel } from "../models/project-model.js";
import { UserModel } from "../models/user-model.js";
import { ApiError } from "../utils/api-error.js";
import { sendSuccess } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

/**
 * GET /api/v1/projects/:slug/feedback?api_key=xxx
 *
 * Programmatic access to approved feedback for business-plan projects.
 * Authentication is via API key (not JWT).
 */
router.get(
  "/projects/:slug/feedback",
  asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const apiKey = req.query.api_key;

    if (!apiKey || typeof apiKey !== "string") {
      throw new ApiError(401, "Missing api_key query parameter");
    }

    const project = await ProjectModel.findOne({ slug, apiKey });
    if (!project) {
      throw new ApiError(401, "Invalid API key or project not found");
    }

    // Verify the project owner has a business plan
    const owner = await UserModel.findById(project.userId).lean();
    if (!owner || owner.plan !== "business") {
      throw new ApiError(
        403,
        "API access requires the Business plan. Upgrade at /pricing."
      );
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const query = { projectId: project._id, status: "approved" };

    if (req.query.type && ["video", "audio", "text"].includes(req.query.type)) {
      query.type = req.query.type;
    }

    const [items, total] = await Promise.all([
      FeedbackModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("-__v")
        .lean(),
      FeedbackModel.countDocuments(query)
    ]);

    return sendSuccess(res, {
      project: { id: project._id, name: project.name, slug: project.slug },
      items,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) }
    });
  })
);

export { router as v1Router };
