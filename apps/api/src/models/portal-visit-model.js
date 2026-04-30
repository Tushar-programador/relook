import mongoose from "mongoose";

const portalVisitSchema = new mongoose.Schema(
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
    },
    openCount: {
      type: Number,
      default: 1,
      min: 1
    },
    lastOpenedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

portalVisitSchema.index({ projectId: 1, visitorId: 1 }, { unique: true });

export const PortalVisitModel = mongoose.model("PortalVisit", portalVisitSchema);
