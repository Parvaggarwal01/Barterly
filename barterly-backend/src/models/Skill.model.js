import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Skill title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Skill description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    offeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    level: {
      type: String,
      enum: {
        values: ["beginner", "intermediate", "advanced"],
        message: "{VALUE} is not a valid skill level",
      },
      required: [true, "Skill level is required"],
    },
    deliveryMode: {
      type: String,
      enum: {
        values: ["online", "in-person", "both"],
        message: "{VALUE} is not a valid delivery mode",
      },
      required: [true, "Delivery mode is required"],
    },
    availability: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: {
        values: ["pending", "approved", "rejected"],
        message: "{VALUE} is not a valid verification status",
      },
      default: "pending",
    },
    verificationDocuments: [
      {
        type: {
          type: String,
          enum: ["cv", "certificate", "portfolio_link", "other"],
        },
        url: {
          type: String,
        },
        public_id: {
          type: String,
        },
      },
    ],
    verificationNote: {
      type: String,
      trim: true,
    },
    learningOutcomes: [
      {
        type: String,
        trim: true,
      },
    ],
    prerequisites: {
      type: String,
      trim: true,
      maxlength: [500, "Prerequisites cannot exceed 500 characters"],
    },
    savedCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
skillSchema.index({ offeredBy: 1, isActive: 1 });
skillSchema.index({ category: 1, isActive: 1 });
skillSchema.index({ verificationStatus: 1 });
skillSchema.index({ createdAt: -1 });

// Update category skill count when skill is saved
skillSchema.post("save", async function () {
  if (this.isActive) {
    const Category = mongoose.model("Category");
    await Category.findByIdAndUpdate(this.category, {
      $inc: { skillCount: 1 },
    });
  }
});

// Update category skill count when skill is deleted
skillSchema.post("findOneAndDelete", async function (doc) {
  if (doc && doc.isActive) {
    const Category = mongoose.model("Category");
    await Category.findByIdAndUpdate(doc.category, {
      $inc: { skillCount: -1 },
    });
  }
});

const Skill = mongoose.model("Skill", skillSchema);

export default Skill;
