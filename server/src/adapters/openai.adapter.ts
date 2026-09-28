import type { ChatMessage } from "../types/chat.js";

/**
 * Responsible for converting ChatMessage[] to OpenAI.Responses.ResponseInput
 * (Only conversion)
 */
export class OpenAIAdapter {
  static toResponsesInput(messages: ChatMessage[]) {
    return messages.map(({ role, content }) => ({
      role,
      content,
    }));
  }
}
