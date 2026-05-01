import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true
    },
    invitedEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    role: {
      type: String,
      enum: ["viewer", "admin"],
      default: "viewer"
    },
    inviteToken: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "accepted"],
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

teamMemberSchema.index({ projectId: 1, invitedEmail: 1 }, { unique: true });

export const TeamMemberModel = mongoose.model("TeamMember", teamMemberSchema);
