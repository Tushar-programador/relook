import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ["video", "audio", "text"],
      required: true
    },
    mediaUrl: {
      type: String,
      default: ""
    },
    thumbnailUrl: {
      type: String,
      default: ""
    },
    message: {
      type: String,
      default: ""
    },
    name: {
      type: String,
      default: "Anonymous"
    },
    email: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true
    },
    metadata: {
      durationSeconds: { type: Number, default: 0 },
      mimeType: { type: String, default: "" }
    }
  },
  {
    timestamps: true
  }
);

feedbackSchema.index({ projectId: 1, status: 1 });

export const FeedbackModel = mongoose.model("Feedback", feedbackSchema);