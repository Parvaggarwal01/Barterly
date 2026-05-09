import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: [
        "barter_request",
        "barter_accepted",
        "barter_rejected",
        "barter_completed",
        "new_message",
        "review_received",
        "skill_verified",
        "skill_rejected",
        "report_resolved",
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String, // frontend route
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
