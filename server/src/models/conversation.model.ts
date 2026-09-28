import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const ConversationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "New Conversation",
    },
    messages: {
      type: [MessageSchema],
      default: [],
    },
  },
  { timestamps: true },
);

export const Conversation = mongoose.model("Conversation", ConversationSchema);
