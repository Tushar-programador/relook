import crypto from "crypto";
import { ProjectModel } from "../models/project-model.js";
import { TeamMemberModel } from "../models/team-member-model.js";
import { UserModel } from "../models/user-model.js";
import { ApiError } from "../utils/api-error.js";
import { sendInviteEmail } from "./mail-service.js";
import { env } from "../config/env.js";

async function ensureProjectOwnership(userId, projectId) {
  const project = await ProjectModel.findOne({ _id: projectId, userId });
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  return project;
}

export async function listTeamMembers(userId, projectId) {
  await ensureProjectOwnership(userId, projectId);
  return TeamMemberModel.find({ projectId })
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .lean();
}

export async function inviteTeamMember(userId, projectId, { email, role = "viewer" }) {
  const project = await ensureProjectOwnership(userId, projectId);

  const existing = await TeamMemberModel.findOne({
    projectId,
    invitedEmail: email.toLowerCase()
  });

  if (existing) {
    throw new ApiError(409, "This email has already been invited to this project");
  }

  const inviteToken = crypto.randomBytes(32).toString("hex");

  const member = await TeamMemberModel.create({
    projectId,
    invitedEmail: email.toLowerCase(),
    role,
    inviteToken,
    status: "pending"
  });

  // If the invited user already has an account, link them immediately
  const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    member.userId = existingUser._id;
    await member.save();
  }

  // Send invite email (best-effort, non-blocking)
  const acceptUrl = `${env.CLIENT_URL}/team/accept/${inviteToken}`;
  sendInviteEmail({ to: email, projectName: project.name, role, acceptUrl }).catch(() => {});

  return member;
}

export async function removeTeamMember(userId, projectId, memberId) {
  await ensureProjectOwnership(userId, projectId);
  const member = await TeamMemberModel.findOne({ _id: memberId, projectId });
  if (!member) throw new ApiError(404, "Team member not found");
  await member.deleteOne();
}

export async function acceptTeamInvite(inviteToken, userId) {
  const member = await TeamMemberModel.findOne({ inviteToken });
  if (!member) {
    throw new ApiError(404, "Invalid or expired invite link");
  }

  if (member.status === "accepted") {
    return { alreadyAccepted: true };
  }

  member.userId = userId;
  member.status = "accepted";
  await member.save();

  return { accepted: true, projectId: member.projectId, role: member.role };
}

/**
 * Check whether userId is an accepted team member of projectId.
 */
export async function isTeamMember(userId, projectId) {
  const member = await TeamMemberModel.findOne({
    projectId,
    userId,
    status: "accepted"
  });
  return Boolean(member);
}
