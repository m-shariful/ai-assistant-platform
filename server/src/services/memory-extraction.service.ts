import { MEMORY_EXTRACTION_PROMPT } from "../prompts/memory-extraction.prompt.js";
import type { ChatMessage } from "../types/chat.js";
import type { MemoryItem } from "../types/memory.js";
import { openAIService } from "./openai.service.js";

/**
 * Responsible for:
 * [+] Text to JSON
 */

// decides what to store
export class MemoryExtractionService {
  static async extractFromMessage(
    latestMessage: ChatMessage,
  ): Promise<MemoryItem[]> {
    const response = await openAIService.getClient().responses.create({
      model: "gpt-5-mini",
      input: [
        {
          role: "system",
          content: MEMORY_EXTRACTION_PROMPT,
        },
        {
          role: "user",
          content: latestMessage.content,
        },
      ],
    });

    try {
      return JSON.parse(response.output_text) as MemoryItem[];
    } catch (error) {
      console.error("Memory extraction Error:", error);
      return [];
    }
  }
}
