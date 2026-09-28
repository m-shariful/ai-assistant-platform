import OpenAI from "openai";

class OpenAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  getClient() {
    return this.client;
  }
}

export const openAIService = new OpenAIService();
