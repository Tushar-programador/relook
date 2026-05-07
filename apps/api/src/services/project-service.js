import crypto from "crypto";
import mongoose from "mongoose";
import { FeedbackModel } from "../models/feedback-model.js";
import { PortalOpenEventModel } from "../models/portal-open-event-model.js";
import { PortalVisitModel } from "../models/portal-visit-model.js";
import { ProjectModel } from "../models/project-model.js";
import { UserModel } from "../models/user-model.js";
import { isMailConfigured, sendPortalLinkEmail } from "./mail-service.js";
import { enqueuePortalLinkEmailJob } from "./portal-link-queue-service.js";
import { ApiError } from "../utils/api-error.js";
import { createSlug } from "../utils/slugify.js";

const PROJECT_LIMITS = { free: 1, pro: 5, business: Infinity };

function makeLastNDaysLabels(days) {
  const labels = [];
  const now = new Date();

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    labels.push(date.toISOString().slice(0, 10));
  }

  return labels;
}

async function ensureSlugAvailability(slug, excludedId = null) {
  const existingProject = await ProjectModel.findOne({
    slug,
    ...(excludedId ? { _id: { $ne: excludedId } } : {})
  });

  if (existingProject) {
    throw new ApiError(409, "Project slug already exists");
  }
}

export async function createProject(userId, input) {
  const user = await UserModel.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const maxProjects = PROJECT_LIMITS[user.plan] ?? 1;
  if (maxProjects !== Infinity) {
    const existing = await ProjectModel.countDocuments({ userId });
    if (existing >= maxProjects) {
      throw new ApiError(
        403,
        `Your ${user.plan} plan allows a maximum of ${maxProjects} project${maxProjects === 1 ? "" : "s"}. Upgrade to create more.`
      );
    }
  }

  const slug = createSlug(input.slug || input.name);
  await ensureSlugAvailability(slug);

  return ProjectModel.create({
    userId,
    name: input.name,
    slug,
    organization: input.organization || "",
    purpose: input.purpose || "customer_feedback",
    productType: input.productType || "other",
    website: input.website || "",
    description: input.description || "",
    logo: input.logo || "",
    theme: input.theme || undefined,
    apiKey: crypto.randomUUID()
  });
}

export async function listProjects(userId) {
  const projects = await ProjectModel.find({ userId }).sort({ createdAt: -1 }).lean();
  const projectIds = projects.map((project) => project._id);

  const counts = await FeedbackModel.aggregate([
    {
      $match: {
        projectId: { $in: projectIds }
      }
    },
    {
      $group: {
        _id: "$projectId",
        totalFeedback: { $sum: 1 },
        approvedFeedback: {
          $sum: {
            $cond: [{ $eq: ["$status", "approved"] }, 1, 0]
          }
        }
      }
    }
  ]);

  const countsByProject = Object.fromEntries(
    counts.map((count) => [String(count._id), count])
  );

  const visitStats = await PortalVisitModel.aggregate([
    {
      $match: {
        projectId: { $in: projectIds }
      }
    },
    {
      $group: {
        _id: "$projectId",
        totalLinkOpens: { $sum: "$openCount" },
        uniqueLinkVisitors: { $sum: 1 }
      }
    }
  ]);

  const visitStatsByProject = Object.fromEntries(
    visitStats.map((item) => [String(item._id), item])
  );

  return projects.map((project) => ({
    ...project,
    stats: {
      ...(countsByProject[String(project._id)] || {
        totalFeedback: 0,
        approvedFeedback: 0
      }),
      ...(visitStatsByProject[String(project._id)] || {
        totalLinkOpens: 0,
        uniqueLinkVisitors: 0
      })
    }
  }));
}

export async function getProjectById(userId, projectId) {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(404, "Project not found");
  }

  const project = await ProjectModel.findOne({ _id: projectId, userId });
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return project;
}

export async function getProjectBySlug(projectSlug) {
  const project = await ProjectModel.findOne({ slug: projectSlug });
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return project;
}

export async function updateProject(userId, projectId, input) {
  const project = await getProjectById(userId, projectId);

  if (input.slug || input.name) {
    const slug = createSlug(input.slug || input.name);
    await ensureSlugAvailability(slug, projectId);
    project.slug = slug;
  }

  if (typeof input.name === "string") {
    project.name = input.name;
  }

  if (typeof input.logo === "string") {
    project.logo = input.logo;
  }

  if (input.theme) {
    project.theme = {
      ...project.theme,
      ...input.theme
    };
  }

  if (typeof input.customCss === "string") {
    project.customCss = input.customCss;
  }

  if (input.wallSettings) {
    project.wallSettings = {
      ...(project.wallSettings || {}),
      theme: {
        ...(project.wallSettings?.theme || {}),
        ...(input.wallSettings.theme || {})
      },
      layout: input.wallSettings.layout || project.wallSettings?.layout || {}
    };
    project.markModified("wallSettings");
  }

  await project.save();
  return project;
}

export async function regenProjectApiKey(userId, projectId) {
  const project = await getProjectById(userId, projectId);
  project.apiKey = crypto.randomUUID();
  await project.save();
  return { apiKey: project.apiKey };
}

export async function deleteProject(userId, projectId) {
  const project = await getProjectById(userId, projectId);
  await FeedbackModel.deleteMany({ projectId: project._id });
  await PortalOpenEventModel.deleteMany({ projectId: project._id });
  await PortalVisitModel.deleteMany({ projectId: project._id });
  await project.deleteOne();
}

export async function getProjectAnalytics(userId, projectId) {
  const project = await getProjectById(userId, projectId);

  const [summary] = await FeedbackModel.aggregate([
    { $match: { projectId: project._id } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        video: {
          $sum: {
            $cond: [{ $eq: ["$type", "video"] }, 1, 0]
          }
        },
        audio: {
          $sum: {
            $cond: [{ $eq: ["$type", "audio"] }, 1, 0]
          }
        },
        text: {
          $sum: {
            $cond: [{ $eq: ["$type", "text"] }, 1, 0]
          }
        },
        pending: {
          $sum: {
            $cond: [{ $eq: ["$status", "pending"] }, 1, 0]
          }
        },
        approved: {
          $sum: {
            $cond: [{ $eq: ["$status", "approved"] }, 1, 0]
          }
        },
        rejected: {
          $sum: {
            $cond: [{ $eq: ["$status", "rejected"] }, 1, 0]
          }
        }
      }
    }
  ]);

  const [visitSummary] = await PortalVisitModel.aggregate([
    { $match: { projectId: project._id } },
    {
      $group: {
        _id: null,
        totalLinkOpens: { $sum: "$openCount" },
        uniqueLinkVisitors: { $sum: 1 }
      }
    }
  ]);

  const timelineDays = 14;
  const timelineStart = new Date();
  timelineStart.setHours(0, 0, 0, 0);
  timelineStart.setDate(timelineStart.getDate() - (timelineDays - 1));

  const [dailyOpens, dailyResponses] = await Promise.all([
    PortalOpenEventModel.aggregate([
      { $match: { projectId: project._id, createdAt: { $gte: timelineStart } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          opens: { $sum: 1 }
        }
      }
    ]),
    FeedbackModel.aggregate([
      { $match: { projectId: project._id, createdAt: { $gte: timelineStart } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          responses: { $sum: 1 }
        }
      }
    ])
  ]);

  const opensByDate = Object.fromEntries(dailyOpens.map((entry) => [entry._id, entry.opens]));
  const responsesByDate = Object.fromEntries(dailyResponses.map((entry) => [entry._id, entry.responses]));
  const timeline = makeLastNDaysLabels(timelineDays).map((date) => ({
    date,
    opens: opensByDate[date] || 0,
    responses: responsesByDate[date] || 0
  }));

  const recentResponses = await FeedbackModel.find({ projectId: project._id })
    .sort({ createdAt: -1 })
    .limit(12)
    .select("name email type status createdAt")
    .lean();

  const totalFeedback = summary?.total || 0;
  const totalLinkOpens = visitSummary?.totalLinkOpens || 0;
  const responseRate = totalLinkOpens > 0 ? Number(((totalFeedback / totalLinkOpens) * 100).toFixed(1)) : 0;

  return {
    project,
    metrics: summary || {
      total: 0,
      video: 0,
      audio: 0,
      text: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    },
    linkMetrics: {
      totalLinkOpens,
      uniqueLinkVisitors: visitSummary?.uniqueLinkVisitors || 0,
      totalResponses: totalFeedback,
      responseRate
    },
    timeline,
    responders: recentResponses
  };
}

export async function sendProjectPortalLinks(userId, projectId, input) {
  const project = await getProjectById(userId, projectId);
  const user = await UserModel.findById(userId).select("plan");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!isMailConfigured()) {
    throw new ApiError(503, "Email service is not configured. Add SMTP settings first.");
  }

  const canRemovePromotion = user.plan !== "free";
  const includePromotion = canRemovePromotion ? !input.removePromotion : true;
  const portalUrl = `${input.appBaseUrl.replace(/\/$/, "")}/feedback/${project.slug}`;

  if (input.recipients.length === 1) {
    await sendPortalLinkEmail({
      to: input.recipients[0],
      subject: input.subject,
      body: input.body,
      portalUrl,
      includePromotion
    });
  } else {
    await enqueuePortalLinkEmailJob({
      recipients: input.recipients,
      subject: input.subject,
      body: input.body,
      portalUrl,
      includePromotion
    });
  }

  return {
    sent: input.recipients.length,
    includePromotion,
    plan: user.plan,
    queued: input.recipients.length > 1
  };
}