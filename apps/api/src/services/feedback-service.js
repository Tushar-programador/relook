import mongoose from "mongoose";
import { FeedbackModel } from "../models/feedback-model.js";
import { PortalOpenEventModel } from "../models/portal-open-event-model.js";
import { PortalVisitModel } from "../models/portal-visit-model.js";
import { ProjectModel } from "../models/project-model.js";
import { UserModel } from "../models/user-model.js";
import { ApiError } from "../utils/api-error.js";
import { dispatchWebhookEvent } from "./webhook-service.js";

// Per-plan monthly response caps (Infinity = unlimited)
const MONTHLY_RESPONSE_LIMITS = { free: 50, pro: Infinity, business: Infinity };
// Per-plan max media duration in seconds (video and audio)
const MEDIA_DURATION_LIMITS = { free: 10, pro: 30, business: 60 };

export async function submitFeedback(projectSlug, input) {
  const project = await ProjectModel.findOne({ slug: projectSlug });
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (input.type !== "text" && !input.mediaUrl) {
    throw new ApiError(400, "mediaUrl is required for audio and video feedback");
  }

  // Fetch the project owner to apply plan-based limits
  const owner = await UserModel.findById(project.userId).lean();
  const plan = owner?.plan || "free";

  // Enforce monthly response cap
  const monthlyLimit = MONTHLY_RESPONSE_LIMITS[plan] ?? 50;
  if (monthlyLimit !== Infinity) {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const countThisMonth = await FeedbackModel.countDocuments({
      projectId: project._id,
      createdAt: { $gte: monthStart }
    });
    if (countThisMonth >= monthlyLimit) {
      throw new ApiError(
        429,
        `This project has reached its ${monthlyLimit} feedback submissions limit for this month. The owner can upgrade their plan for unlimited responses.`
      );
    }
  }

  // Enforce media duration limit (video and audio)
  if ((input.type === "video" || input.type === "audio") && typeof input.metadata?.durationSeconds === "number") {
    const maxSeconds = MEDIA_DURATION_LIMITS[plan] ?? 10;
    if (input.metadata.durationSeconds > maxSeconds) {
      throw new ApiError(
        400,
        `${input.type === "video" ? "Video" : "Audio"} exceeds the ${maxSeconds}-second limit for this project's plan.`
      );
    }
  }

  const feedback = await FeedbackModel.create({
    projectId: project._id,
    type: input.type,
    mediaUrl: input.mediaUrl || "",
    thumbnailUrl: input.thumbnailUrl || "",
    message: input.message || "",
    name: input.name || "Anonymous",
    email: input.email || "",
    metadata: input.metadata || undefined
  });

  // Fire-and-forget: dispatch webhook event to any registered webhooks
  dispatchWebhookEvent(project._id, "feedback.submitted", {
    feedbackId: feedback._id,
    type: feedback.type,
    name: feedback.name,
    projectSlug: project.slug
  });

  return feedback;
}

async function ensureProjectOwnership(userId, projectId) {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(404, "Project not found");
  }

  const project = await ProjectModel.findOne({ _id: projectId, userId });
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return project;
}

export async function listFeedback(userId, projectId, filters) {
  const project = await ensureProjectOwnership(userId, projectId);
  const page = filters.page || 1;
  const limit = Math.min(filters.limit || 20, 50);
  const query = { projectId: project._id };

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.type) {
    query.type = filters.type;
  }

  const [items, total] = await Promise.all([
    FeedbackModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    FeedbackModel.countDocuments(query)
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit))
    }
  };
}

export async function updateFeedbackStatus(userId, feedbackId, status) {
  if (!mongoose.Types.ObjectId.isValid(feedbackId)) {
    throw new ApiError(404, "Feedback not found");
  }

  const feedback = await FeedbackModel.findById(feedbackId);
  if (!feedback) {
    throw new ApiError(404, "Feedback not found");
  }

  await ensureProjectOwnership(userId, feedback.projectId);
  feedback.status = status;
  await feedback.save();

  // Fire-and-forget webhook for approved/rejected status changes
  if (status === "approved" || status === "rejected") {
    dispatchWebhookEvent(feedback.projectId, `feedback.${status}`, {
      feedbackId: feedback._id,
      type: feedback.type,
      name: feedback.name,
      status
    });
  }

  return feedback;
}

export async function deleteFeedback(userId, feedbackId) {
  if (!mongoose.Types.ObjectId.isValid(feedbackId)) {
    throw new ApiError(404, "Feedback not found");
  }

  const feedback = await FeedbackModel.findById(feedbackId);
  if (!feedback) {
    throw new ApiError(404, "Feedback not found");
  }

  await ensureProjectOwnership(userId, feedback.projectId);
  await feedback.deleteOne();
}

export async function getApprovedFeedback(projectSlug) {
  const project = await ProjectModel.findOne({ slug: projectSlug }).lean();
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const items = await FeedbackModel.find({
    projectId: project._id,
    status: "approved"
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  // Determine whether FeedSpace branding should be shown (free plan = yes)
  const owner = await UserModel.findById(project.userId).lean();
  const showBranding = !owner || owner.plan === "free";

  const mediaDurationLimit = MEDIA_DURATION_LIMITS[owner?.plan ?? "free"] ?? 10;

  return {
    project,
    items,
    showBranding,
    customCss: project.customCss || "",
    wallSettings: project.wallSettings || {},
    mediaDurationLimit
  };
}

export async function trackPublicFeedbackOpen(projectSlug, visitorId) {
  const project = await ProjectModel.findOne({ slug: projectSlug }).lean();
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (!visitorId) {
    return { tracked: false };
  }

  const now = new Date();
  const dedupeWindowMs = 15 * 1000;
  const minLastOpenedAt = new Date(now.getTime() - dedupeWindowMs);

  let updateResult;

  try {
    updateResult = await PortalVisitModel.updateOne(
      {
        projectId: project._id,
        visitorId,
        $or: [{ lastOpenedAt: { $lte: minLastOpenedAt } }, { lastOpenedAt: { $exists: false } }]
      },
      {
        $set: { lastOpenedAt: now },
        $inc: { openCount: 1 }
      },
      { upsert: true }
    );
  } catch (error) {
    // If two requests race on first visit, unique index may throw for one of them.
    // Treat the loser as a duplicate and avoid double counting.
    if (error?.code === 11000) {
      return { tracked: true, deduped: true };
    }

    throw error;
  }

  const counted = (updateResult.modifiedCount || 0) > 0 || (updateResult.upsertedCount || 0) > 0;
  if (!counted) {
    return { tracked: true, deduped: true };
  }

  await PortalOpenEventModel.create({
    projectId: project._id,
    visitorId
  });

  return { tracked: true, deduped: false };
}