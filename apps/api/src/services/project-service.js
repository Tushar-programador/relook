import mongoose from "mongoose";
import { FeedbackModel } from "../models/feedback-model.js";
import { ProjectModel } from "../models/project-model.js";
import { ApiError } from "../utils/api-error.js";
import { createSlug } from "../utils/slugify.js";

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
    theme: input.theme || undefined
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

  return projects.map((project) => ({
    ...project,
    stats: countsByProject[String(project._id)] || {
      totalFeedback: 0,
      approvedFeedback: 0
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

  await project.save();
  return project;
}

export async function deleteProject(userId, projectId) {
  const project = await getProjectById(userId, projectId);
  await FeedbackModel.deleteMany({ projectId: project._id });
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
    }
  };
}