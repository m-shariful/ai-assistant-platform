import { Knowledge } from "../models/knowledge.model.js";
import { EmbeddingService } from "./embedding.service.js";

export interface RetrievedKnowledge {
  chunkId: string;
  documentId: string;
  content: string;
  index: number;
  score: number;

  document?: {
    title: string;
    source: string;
  };
}

// Responsible for semantic retrieval of relevant knowledge chunks.
export class RetrievalService {
  private static readonly DEFAULT_LIMIT = 4;
  private static readonly DEFAULT_MIN_SCORE = 0.7;

  // Search for relevant knowledge chunks
  static async search(
    query: string,
    limit: number = this.DEFAULT_LIMIT,
    minScore: number = this.DEFAULT_MIN_SCORE,
  ): Promise<RetrievedKnowledge[]> {
    const queryEmbedding = await EmbeddingService.createEmbedding(query);

    const candidateLimit = Math.max(limit * 10, 100); // Ensure we have enough candidates to filter down to the desired limit
    // Perform the vector search using MongoDB's $vectorSearch aggregation stage
    const results = await Knowledge.aggregate([
      {
        $vectorSearch: {
          index: "knowledge_vector_index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: candidateLimit,
          limit: candidateLimit, // Fetch more candidates than needed to allow for filtering by minScore
        },
      },
      {
        $project: {
          _id: 0,
          chunkId: 1,
          documentId: 1,
          content: 1,
          index: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
      {
        $match: {
          score: { $gte: minScore },
        },
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: "documents",
          localField: "documentId",
          foreignField: "_id",
          as: "document",
        },
      },
      {
        $unwind: {
          path: "$document",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          chunkId: 1,
          documentId: 1,
          content: 1,
          index: 1,
          score: 1,
          document: {
            title: "$document.title",
            source: "$document.source",
          },
        },
      },
    ]);

    return results as RetrievedKnowledge[];
  }

  // Evaluation/debugging for evaluating retrieval quality
  static async searchWithScores(
    query: string,
    limit: number = this.DEFAULT_LIMIT,
  ): Promise<RetrievedKnowledge[]> {
    const queryEmbedding = await EmbeddingService.createEmbedding(query);

    const candidateLimit = Math.max(limit * 10, 100);

    const results = await Knowledge.aggregate([
      {
        $vectorSearch: {
          index: "knowledge_vector_index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: candidateLimit,
          limit: candidateLimit,
        },
      },
      {
        $project: {
          _id: 0,
          chunkId: 1,
          documentId: 1,
          content: 1,
          index: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
      {
        $limit: limit,
      },
    ]);

    return results as RetrievedKnowledge[];
  }

  // Developer diagnostic tool for evaluating retrieval quality
  static async debugSearch(query: string) {
    const queryEmbedding = await EmbeddingService.createEmbedding(query);

    const results = await Knowledge.aggregate([
      {
        $vectorSearch: {
          index: "knowledge_vector_index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: 10,
        },
      },
      {
        $project: {
          _id: 0,
          chunkId: 1,
          documentId: 1,
          content: 1,
          index: 1,
          score: {
            $meta: "vectorSearchScore",
          },
        },
      },
    ]);

    return results;
  }
}
