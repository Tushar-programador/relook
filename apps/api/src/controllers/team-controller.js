import { z } from "zod";
import {
  acceptTeamInvite,
  inviteTeamMember,
  listTeamMembers,
  removeTeamMember
} from "../services/team-service.js";
import { sendSuccess } from "../utils/api-response.js";

export const inviteSchema = z.object({
  email: z.email(),
  role: z.enum(["viewer", "admin"]).optional().default("viewer")
});

export async function list(req, res) {
  const data = await listTeamMembers(req.user._id, req.params.projectId);
  return sendSuccess(res, data);
}

export async function invite(req, res) {
  const data = await inviteTeamMember(req.user._id, req.params.projectId, req.body);
  return sendSuccess(res, data, 201);
}

export async function remove(req, res) {
  await removeTeamMember(req.user._id, req.params.projectId, req.params.memberId);
  return sendSuccess(res, { removed: true });
}

export async function acceptInvite(req, res) {
  const data = await acceptTeamInvite(req.params.token, req.user._id);
  return sendSuccess(res, data);
}
