import { z } from "zod";
import { getProjectById, getProjectBySlug } from "../services/project-service.js";
import { createSignedUploadParams } from "../services/upload-service.js";
import { sendSuccess } from "../utils/api-response.js";

export const uploadSchema = z.object({
  projectId: z.string().min(1),
  contentType: z.string().min(3)
});

export const publicUploadSchema = z.object({
  slug: z.string().min(2),
  contentType: z.string().min(3)
});

export async function sign(req, res) {
  const project = await getProjectById(req.user._id, req.body.projectId);
  const result = createSignedUploadParams({
    contentType: req.body.contentType,
    projectSlug: project.slug
  });

  return sendSuccess(res, result);
}

export async function signPublic(req, res) {
  const project = await getProjectBySlug(req.body.slug);
  const result = createSignedUploadParams({
    contentType: req.body.contentType,
    projectSlug: project.slug
  });

  return sendSuccess(res, result);
}