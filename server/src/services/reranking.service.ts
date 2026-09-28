import { RelevanceService } from "./relevance.service.js";
import type { RetrievedKnowledge } from "./retrieval.service.js";

export interface RerankedKnowledge extends RetrievedKnowledge {
  relevanceScore: number;
  relevanceReason?: string;
}

export class RerankingService {
  /**
   * Minimum semantic relevance required for a chunk to become part of the final RAG context.
   * Vector similarity answers:
   *   "Is this text semantically similar to the query?"
   * Reranking answers:
   *   "Does this text actually help answer the query?"
   * We use the reranking score as the final relevance gate.
   */
  private static readonly MIN_RELEVANCE_SCORE = 0.7;

  static async rerank(
    query: string,
    results: RetrievedKnowledge[],
  ): Promise<RerankedKnowledge[]> {
    if (!results.length) {
      return [];
    }

    const evaluated = await Promise.all(
      results.map(async (result) => {
        const relevance = await RelevanceService.evaluate(
          query,
          result.content,
        );

        return {
          ...result,
          relevanceScore: relevance.score,
          relevanceReason: relevance.reason,
        };
      }),
    );

    const reranked = evaluated
      .filter((result) => result.relevanceScore >= this.MIN_RELEVANCE_SCORE)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .map((result) => ({
        ...result,
        relevanceReason: result.relevanceReason ?? "",
      }));

    return reranked;
  }
}
