import mongoose from "mongoose";

const portalOpenEventSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true
    },
    visitorId: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

portalOpenEventSchema.index({ projectId: 1, createdAt: -1 });

export const PortalOpenEventModel = mongoose.model("PortalOpenEvent", portalOpenEventSchema);
