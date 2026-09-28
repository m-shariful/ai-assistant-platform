export interface ChatResponse {
  answer: string;
}

export const sendMessage = async (message: string): Promise<ChatResponse> => {
  const response = await fetch("http://localhost:5000/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send message");
  }

  return response.json();
};

export const sendMessageStream = async (
  conversationId: string,
  messages: { role: string; content: string }[],
  onMessage: (message: string) => void,
) => {
  const response = await fetch("http://localhost:5000/chat-stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      conversationId,
      messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const reader = response.body?.getReader();
  if (reader) {
    const decoder = new TextDecoder();
    let done = false;
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      onMessage(chunkValue);
    }
  } else {
    throw new Error("No response body");
  }
};
