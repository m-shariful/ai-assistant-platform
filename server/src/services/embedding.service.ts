import { openAIService } from "./openai.service.js";

export class EmbeddingService {
  static async createEmbedding(text: string): Promise<number[]> {
    const response = await openAIService.getClient().embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    const embedding = response.data.at(0);

    if (!embedding) {
      throw new Error("Embedding generation failed");
    }

    return embedding.embedding;
  }

  // OpenAI supports multiple inputs for embeddings, so we can create embeddings for multiple texts at once.
  static async createEmbeddings(texts: string[]): Promise<number[][]> {
    const response = await openAIService.getClient().embeddings.create({
      model: "text-embedding-3-small",
      input: texts,
    });

    return response.data
      .sort((a, b) => a.index - b.index)
      .map(({ embedding }) => embedding);
  }
}
