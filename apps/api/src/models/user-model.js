import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    codeHash: {
      type: String,
      default: ""
    },
    expiresAt: {
      type: Date,
      default: null
    },
    purpose: {
      type: String,
      enum: ["email-verification", "password-reset", ""],
      default: ""
    }
  },
  {
    _id: false
  }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
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
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    otp: {
      type: otpSchema,
      default: () => ({})
    },
    stripeCustomerId: {
      type: String,
      default: ""
    },
    stripeSubscriptionId: {
      type: String,
      default: ""
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