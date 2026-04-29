import { z } from "zod";
import {
  createProject,
  deleteProject,
  getProjectAnalytics,
  listProjects,
  updateProject
} from "../services/project-service.js";
import { sendSuccess } from "../utils/api-response.js";

const PURPOSE_VALUES = ["customer_feedback", "product_review", "employee_survey", "event_feedback", "other"];
const PRODUCT_TYPE_VALUES = ["saas", "mobile_app", "ecommerce", "agency", "education", "healthcare", "other"];

export const createProjectSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional(),
  organization: z.string().max(120).optional(),
  purpose: z.enum(PURPOSE_VALUES).optional(),
  productType: z.enum(PRODUCT_TYPE_VALUES).optional(),
  website: z.string().url().or(z.literal("")).optional(),
  description: z.string().max(500).optional(),
  logo: z.union([z.url(), z.literal("")]).optional(),
  theme: z
    .object({
      primaryColor: z.string().optional(),
      accentColor: z.string().optional()
    })
    .optional()
});

export const updateProjectSchema = createProjectSchema.partial();

export async function create(req, res) {
  const project = await createProject(req.user._id, req.body);
  return sendSuccess(res, project, 201);
}

export async function list(req, res) {
  const projects = await listProjects(req.user._id);
  return sendSuccess(res, projects);
}

export async function update(req, res) {
  const project = await updateProject(req.user._id, req.params.id, req.body);
  return sendSuccess(res, project);
}

export async function remove(req, res) {
  await deleteProject(req.user._id, req.params.id);
  return sendSuccess(res, { deleted: true });
}

export async function analytics(req, res) {
  const data = await getProjectAnalytics(req.user._id, req.params.id);
  return sendSuccess(res, data);
}