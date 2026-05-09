import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportedSkill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      default: null,
    },
    barter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BarterRequest",
      default: null,
    },
    reason: {
      type: String,
      enum: [
        "spam",
        "fake_skill",
        "harassment",
        "scam",
        "inappropriate",
        "other",
      ],
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "dismissed"],
      default: "pending",
    },
    adminNote: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

reportSchema.index({ reporter: 1, reportedUser: 1, barter: 1 });
reportSchema.index({ status: 1, createdAt: -1 });

const Report = mongoose.model("Report", reportSchema);

export default Report;
