import type { ChatMessage } from "../types/chat.js";
import { MemoryExtractionService } from "./memory-extraction.service.js";
import { MemoryService } from "./memory.service.js";

/**
 * Responsible for:
 * [+] Extract
 * [+] Validate
 * [+] Persist
 */
export class MemoryPipelineService {
  static async process(
    userId: string,
    latestMessage: ChatMessage,
  ): Promise<void> {
    const memories =
      await MemoryExtractionService.extractFromMessage(latestMessage);

    console.log("Extracted memories:", memories);

    if (!memories.length) {
      return;
    }

    for (const memory of memories) {
      await MemoryService.saveOrUpdateMemory(
        userId,
        memory.key,
        memory.value,
        memory.importance,
      );
    }
  }
}
