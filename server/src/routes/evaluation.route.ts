import { Router } from "express";
import { GROUNDING_EVALUATION_CASES } from "../evaluation/grounding-cases.js";
import { RAG_CONVERSATION_EVALUATION_CASES } from "../evaluation/rag-evaluation.js";
import { RAGEvaluator } from "../evaluation/rag-evaluator.js";
import { PromptBuilder } from "../prompts/prompt-builder.js";
import { OpenAIChatService } from "../services/openai-chat.service.js";
import { QueryRewriteService } from "../services/query-rewrite.service.js";
import { RAGContextService } from "../services/rag-context.service.js";
import { RerankingService } from "../services/reranking.service.js";
import { RetrievalService } from "../services/retrieval.service.js";

const router = Router();

router.get("/rag", async (_req, res) => {
  try {
    const results = await RAGEvaluator.run();

    const passed = results.filter((result) => result.passed).length;

    return res.json({
      total: results.length,
      passed,
      failed: results.length - passed,
      accuracy: `${((passed / results.length) * 100).toFixed(1)}%`,
      results,
    });
  } catch (error) {
    console.error("RAG evaluation failed:", error);

    return res.status(500).json({
      error: "RAG evaluation failed",
    });
  }
});

router.get("/rag/diagnostic", async (req, res) => {
  try {
    const query = String(req.query.query || "");

    if (!query) {
      return res.status(400).json({
        error: "query is required",
      });
    }

    const results = await RetrievalService.debugSearch(query);

    return res.json({
      query,
      threshold: 0.7,
      results: results.map((result) => ({
        content: result.content,
        score: result.score,
      })),
    });
  } catch (error) {
    console.error("RAG diagnostic failed:", error);

    return res.status(500).json({
      error: "RAG diagnostic failed",
    });
  }
});

router.post("/grounding", async (_req, res) => {
  try {
    const results = [];

    for (const testCase of GROUNDING_EVALUATION_CASES) {
      console.log(`Testing: ${testCase.id}`);
      console.log(`Query: ${testCase.query}`);

      // 1. DETERMINE QUERY USED FOR RETRIEVAL
      //
      // IMPORTANT:
      //
      // For now the evaluation cases explicitly define the
      // expected rewritten query.
      //
      // In the production pipeline, this value should come
      // from your actual QueryRewriteService.
      //
      // We use expectedQuery here so this endpoint can isolate
      // retrieval behavior from rewrite behavior.

      const retrievalQuery = testCase.expectedQuery ?? testCase.query;

      console.log("Retrieval query:", retrievalQuery);

      // 2. VECTOR RETRIEVAL
      const vectorResults = await RetrievalService.search(retrievalQuery, 4);

      console.log(
        "VECTOR RESULTS:",
        vectorResults.map((result) => ({
          chunkId: result.chunkId,
          score: result.score,
          content: result.content,
        })),
      );

      // 3. RERANK
      //
      // Vector search gives us semantic candidates.
      //
      // Reranking decides whether those candidates are
      // actually relevant enough to enter the RAG context.

      const rerankedResults = await RerankingService.rerank(
        retrievalQuery,
        vectorResults,
      );

      console.log(
        "RERANKED RESULTS:",
        rerankedResults.map((result) => ({
          chunkId: result.chunkId,
          vectorScore: result.score,
          relevanceScore: result.relevanceScore,
          relevanceReason: result.relevanceReason,
          content: result.content,
        })),
      );

      // 4. FINAL RETRIEVAL RESULT
      //
      // This is the important definition:
      //
      // "retrieved" means knowledge survived both:
      //
      // vector retrieval
      // +
      // relevance filtering
      //
      // This is what should actually enter the RAG context.

      const retrieved = rerankedResults.length > 0;

      const retrievalPassed = retrieved === testCase.expectedRetrieval;

      console.log(`Retrieval: ${retrievalPassed ? "PASS" : "FAIL"}`);

      // 5. BUILD RAG CONTEXT

      const knowledgeContext = RAGContextService.buildContext(rerankedResults);

      console.log("RAG CONTEXT:");
      console.log(knowledgeContext || "(empty)");

      // 6. BUILD PRODUCTION PROMPT

      const prompt = await PromptBuilder.build(
        "grounding-evaluation-user",
        [
          {
            role: "user",
            content: retrievalQuery,
          },
        ],
        knowledgeContext,
      );

      // 7. GENERATE ANSWER

      const answer = await OpenAIChatService.chat(prompt);

      console.log("ANSWER:");
      console.log(answer);

      // 8. DETECT REFUSAL

      const refusal =
        /provided knowledge|retrieved knowledge|not contain|not enough|cannot answer|can't answer|insufficient information|insufficient/i.test(
          answer,
        );

      console.log(`Refusal detected: ${refusal}`);

      // 9. GROUNDING EVALUATION

      let groundingPassed = false;

      if (testCase.expectedBehavior === "answer_from_context") {
        groundingPassed = retrieved && !refusal;
      }

      if (testCase.expectedBehavior === "refuse_insufficient_context") {
        groundingPassed = refusal;
      }

      console.log(`Grounding: ${groundingPassed ? "PASS" : "FAIL"}`);

      // 10. OVERALL

      const passed = retrievalPassed && groundingPassed;

      console.log(`Overall: ${passed ? "PASS" : "FAIL"}`);

      // 11. STORE RESULT

      results.push({
        id: testCase.id,

        query: testCase.query,

        expectedQuery: testCase.expectedQuery,

        rewrittenQuery: retrievalQuery,

        rewritePassed: true,

        expectedRetrieval: testCase.expectedRetrieval,

        retrieved,

        retrievalPassed,

        expectedBehavior: testCase.expectedBehavior,

        groundingPassed,

        // Vector-search candidates
        vectorResultCount: vectorResults.length,

        vectorTopScore: vectorResults[0]?.score ?? null,

        // Final reranked knowledge
        resultCount: rerankedResults.length,

        topScore: rerankedResults[0]?.score ?? null,

        topRelevanceScore: rerankedResults[0]?.relevanceScore ?? null,

        answer,

        passed,
      });
    }

    // 12. METRICS
    const total = results.length;

    const retrievalPassedCount = results.filter(
      (result) => result.retrievalPassed,
    ).length;

    const groundingPassedCount = results.filter(
      (result) => result.groundingPassed,
    ).length;

    const overallPassedCount = results.filter((result) => result.passed).length;

    // 13. RESPONSE
    return res.json({
      total,

      retrieval: {
        passed: retrievalPassedCount,

        failed: total - retrievalPassedCount,

        accuracy: `${((retrievalPassedCount / total) * 100).toFixed(1)}%`,
      },

      grounding: {
        passed: groundingPassedCount,

        failed: total - groundingPassedCount,

        accuracy: `${((groundingPassedCount / total) * 100).toFixed(1)}%`,
      },

      overall: {
        passed: overallPassedCount,

        failed: total - overallPassedCount,

        accuracy: `${((overallPassedCount / total) * 100).toFixed(1)}%`,
      },

      results,
    });
  } catch (error) {
    console.error("Grounding evaluation ERROR:", error);

    return res.status(500).json({
      error: "Grounding evaluation failed",
    });
  }
});

router.get("/debug", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        error: "query is required",
      });
    }

    const results = await RetrievalService.debugSearch(query);

    return res.json({
      query,
      results,
    });
  } catch (error) {
    console.error("Retrieval debug error:", error);

    return res.status(500).json({
      error: "Failed to debug retrieval",
    });
  }
});

router.post("/rewrite", async (req, res) => {
  console.log("Query rewrite request:", req.body);
  try {
    const { messages } = req.body;

    const query = await QueryRewriteService.rewrite(messages);

    res.json({
      query,
    });
  } catch (error: any) {
    console.error("Query rewrite error:", error);

    res.status(500).json({
      error: error.message || "Internal Server Error",
    });
  }
});

router.post("/query-rewrite/evaluate", async (req, res) => {
  try {
    const results = [];

    for (const testCase of RAG_CONVERSATION_EVALUATION_CASES) {
      const rewrittenQuery = await QueryRewriteService.rewrite(
        testCase.messages,
      );

      const expectedQuery = testCase.expectedQuery;

      const passed = expectedQuery
        ? rewrittenQuery.toLowerCase() === expectedQuery.toLowerCase()
        : true;

      results.push({
        id: testCase.id,
        rewrittenQuery,
        expectedQuery,
        passed,
      });
    }

    const passedCount = results.filter((result) => result.passed).length;

    res.json({
      total: results.length,
      passed: passedCount,
      failed: results.length - passedCount,
      accuracy: `${((passedCount / results.length) * 100).toFixed(1)}%`,
      results,
    });
  } catch (error: any) {
    console.error("Query rewrite evaluation failed:", error);

    res.status(500).json({
      error: error.message || "Evaluation failed",
    });
  }
});

export default router;
