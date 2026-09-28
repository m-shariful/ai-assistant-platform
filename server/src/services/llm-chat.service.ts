import type { Response } from "express";
import type { ChatMessage } from "../types/chat.js";

// for future use
export interface LLMChatService {
  chat(messages: ChatMessage[]): Promise<string>;

  stream(messages: ChatMessage[], res: Response): Promise<string>;
}
