import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    logo: {
      type: String,
      default: ""
    },
    organization: {
      type: String,
      trim: true,
      default: ""
    },
    purpose: {
      type: String,
      enum: ["customer_feedback", "product_review", "employee_survey", "event_feedback", "other"],
      default: "customer_feedback"
    },
    productType: {
      type: String,
      enum: ["saas", "mobile_app", "ecommerce", "agency", "education", "healthcare", "other"],
      default: "other"
    },
    website: {
      type: String,
      trim: true,
      default: ""
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    theme: {
      primaryColor: { type: String, default: "#0f766e" },
      accentColor: { type: String, default: "#f59e0b" }
    },
    customCss: {
      type: String,
      default: ""
    },
    wallSettings: {
      theme: {
        primaryColor: { type: String, default: "#0f766e" },
        accentColor: { type: String, default: "#f59e0b" },
        backgroundColor: { type: String, default: "#f8fafc" },
        textColor: { type: String, default: "#0f172a" },
        pattern: { type: String, enum: ["dots", "grid", "lines"], default: "dots" }
      },
      layout: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      }
    },
    apiKey: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

// Explicit compound and sort indexes for common query patterns
projectSchema.index({ slug: 1 }, { unique: true });
projectSchema.index({ userId: 1, createdAt: -1 });
projectSchema.index({ createdAt: -1 });

export const ProjectModel = mongoose.model("Project", projectSchema);