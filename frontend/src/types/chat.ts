export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: string;
  content: string;
  isStreaming?: boolean;
}
