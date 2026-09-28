import type { Message } from "./chat";

export interface Conversation {
  _id: string;
  title: string;
  messages: Message[];

  createdAt: string;
  updatedAt: string;
}
