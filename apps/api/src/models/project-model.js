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
    apiKey: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

export const ProjectModel = mongoose.model("Project", projectSchema);