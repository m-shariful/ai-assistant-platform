import mongoose from "mongoose";

const KnowledgeSchema = new mongoose.Schema(
  {
    chunkId: {
      type: String,
      required: true,
      index: true,
    },

    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },

    content: {
      type: String,
      required: true,
    },

    embedding: {
      type: [Number],
      required: true,
    },

    index: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Knowledge = mongoose.model("Knowledge", KnowledgeSchema);
