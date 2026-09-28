import { openAIService } from "./openai.service.js";

export interface RelevanceResult {
  relevant: boolean;
  score: number;
  reason?: string;
}

export class RelevanceService {
  static async evaluate(
    query: string,
    content: string,
  ): Promise<RelevanceResult> {
    const response = await openAIService.getClient().responses.create({
      model: "gpt-5-mini",
      input: [
        {
          role: "system",
          content: `
You are a retrieval relevance evaluator.

Your job is to determine whether the provided knowledge contains
information that is useful for answering the user's question.

Important:
- Semantic similarity alone is not enough.
- The knowledge must contain information that can actually help answer the question.
- If the knowledge only discusses a related topic but does not provide
  enough information to answer the question, mark it as irrelevant.
- Do not use outside knowledge.
- Return JSON only.

Return exactly:
{
  "relevant": true | false,
  "score": 0.0,
  "reason": "short explanation"
}

The score must be between 0 and 1.
        `,
        },
        {
          role: "user",
          content: `
Question:
${query}

Knowledge:
${content}
          `,
        },
      ],
    });

    const text = response.output_text.trim();

    try {
      return JSON.parse(text) as RelevanceResult;
    } catch {
      throw new Error(`Failed to parse relevance evaluation: ${text}`);
    }
  }
}
