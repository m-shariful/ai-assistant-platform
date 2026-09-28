import type { Conversation } from "../types/conversation";

const BASE_URL = "http://localhost:5000";

export async function createConversation(
  title?: string,
): Promise<Conversation> {
  const response = await fetch(`${BASE_URL}/conversations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });

  return response.json();
}

export async function getConversations(): Promise<Conversation[]> {
  const response = await fetch(`${BASE_URL}/conversations`);

  return response.json();
}

export async function getConversation(id: string): Promise<Conversation> {
  const response = await fetch(`${BASE_URL}/conversations/${id}`);

  return response.json();
}
