import mongoose from "mongoose";

const barterRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
      index: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Receiver is required"],
      index: true,
    },
    offeredSkill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: [true, "Offered skill is required"],
    },
    requestedSkill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: [true, "Requested skill is required"],
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "accepted", "rejected", "cancelled", "completed"],
        message: "{VALUE} is not a valid status",
      },
      default: "pending",
      index: true,
    },
    counterOffer: {
      message: {
        type: String,
        trim: true,
        maxlength: [500, "Counter offer message cannot exceed 500 characters"],
      },
      offeredSkill: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill",
      },
      createdAt: {
        type: Date,
      },
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    completedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, "Rejection reason cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Compound indexes for efficient queries
barterRequestSchema.index({ sender: 1, status: 1 });
barterRequestSchema.index({ receiver: 1, status: 1 });
barterRequestSchema.index({ createdAt: -1 });

// Validation: Sender cannot be the same as receiver
barterRequestSchema.pre("save", async function () {
  if (this.sender.toString() === this.receiver.toString()) {
    throw new Error("Cannot send barter request to yourself");
  }
});

// Virtual for checking if barter is active
barterRequestSchema.virtual("isActive").get(function () {
  return this.status === "pending" || this.status === "accepted";
});

// Virtual for checking if barter can be completed
barterRequestSchema.virtual("canBeCompleted").get(function () {
  return this.status === "accepted";
});

// Static method to get user's barter statistics
barterRequestSchema.statics.getBarterStats = async function (userId) {
  const stats = await this.aggregate([
    {
      $match: {
        $or: [{ sender: userId }, { receiver: userId }],
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  return stats.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});
};

const BarterRequest = mongoose.model("BarterRequest", barterRequestSchema);

export default BarterRequest;
