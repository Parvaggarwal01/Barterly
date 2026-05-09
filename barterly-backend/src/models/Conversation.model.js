import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    barter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BarterRequest",
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  {
    timestamps: true,
  }
);

// Ensure conversation has at least 2 participants
conversationSchema.path('participants').validate(function(value) {
  return value.length >= 2;
}, 'Conversations must have at least 2 participants');

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
