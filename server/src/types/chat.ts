export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatStreamRequest {
  conversationId: string;
  messages: ChatMessage[];
}
