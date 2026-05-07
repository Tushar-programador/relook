import { z } from "zod";
import { getProjectById, getProjectBySlug } from "../services/project-service.js";
import { createSignedUploadParams } from "../services/upload-service.js";
import { sendSuccess } from "../utils/api-response.js";

const ALLOWED_CONTENT_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "audio/webm",
  "audio/mp4",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp"
]);

export const uploadSchema = z.object({
  projectId: z.string().min(1),
  contentType: z.string().min(3).refine(
    (ct) => ALLOWED_CONTENT_TYPES.has(ct),
    { message: "Unsupported content type. Allowed: video/mp4, video/webm, audio/*, image/*" }
  )
});

export const publicUploadSchema = z.object({
  slug: z.string().min(2),
  contentType: z.string().min(3).refine(
    (ct) => ALLOWED_CONTENT_TYPES.has(ct),
    { message: "Unsupported content type. Allowed: video/mp4, video/webm, audio/*, image/*" }
  )
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