import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    plan: {
      type: String,
      enum: ["free", "pro", "business"],
      default: "free"
    }
  },
  {
    timestamps: true
  }
);

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    return ret;
  }
});

export const UserModel = mongoose.model("User", userSchema);