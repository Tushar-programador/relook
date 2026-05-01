import mongoose from "mongoose";

const WEBHOOK_EVENTS = ["feedback.submitted", "feedback.approved", "feedback.rejected"];

const webhookSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    events: {
      type: [String],
      enum: WEBHOOK_EVENTS,
      default: ["feedback.submitted"]
    },
    secret: {
      type: String,
      default: ""
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export { WEBHOOK_EVENTS };
export const WebhookModel = mongoose.model("Webhook", webhookSchema);
