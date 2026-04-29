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
    theme: {
      primaryColor: { type: String, default: "#0f766e" },
      accentColor: { type: String, default: "#f59e0b" }
    }
  },
  {
    timestamps: true
  }
);

export const ProjectModel = mongoose.model("Project", projectSchema);