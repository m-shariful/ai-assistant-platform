import { RetrievalService } from "../services/retrieval.service.js";
import { RAG_EVALUATION_CASES } from "./rag-evaluation.js";

interface RAGEvaluationResult {
  query: string;
  expectedRetrieval: boolean;
  retrieved: boolean;
  resultCount: number;
  topScore: number | null | undefined;
  passed: boolean;
}

export class RAGEvaluator {
  static async run(): Promise<RAGEvaluationResult[]> {
    const results: RAGEvaluationResult[] = [];

    for (const testCase of RAG_EVALUATION_CASES) {
      const retrieved = await RetrievalService.search(testCase.query);

      const retrievedSomething = retrieved.length > 0;

      const topScore = retrieved.length > 0 ? retrieved[0]?.score : null;

      const passed = retrievedSomething === testCase.expectedRetrieval;

      results.push({
        query: testCase.query,
        expectedRetrieval: testCase.expectedRetrieval,
        retrieved: retrievedSomething,
        resultCount: retrieved.length,
        topScore,
        passed,
      });
    }

    return results;
  }
}
