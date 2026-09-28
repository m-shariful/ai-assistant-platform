import { useState } from "react";
import { sendMessageStream } from "../../api/chat";
import { useChatStore } from "../../stores/chat.store";

export const ChatInput = () => {
  const [text, setText] = useState("");

  const messages = useChatStore((state) => state.messages);

  const addMessage = useChatStore((state) => state.addMessage);

  const updateMessage = useChatStore((state) => state.updateMessage);

  const setLoading = useChatStore((state) => state.setLoading);

  const isLoading = useChatStore((state) => state.isLoading);

  const conversationId = useChatStore((state) => state.activeConversationId);

  const handleSubmit = async () => {
    if (!text.trim()) {
      return;
    }

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user" as const,
      content: text,
    };

    addMessage(userMessage);

    const prompt = text;
    const assistantMessageId = crypto.randomUUID();

    addMessage({
      id: assistantMessageId,
      role: "assistant" as const,
      content: "",
    });

    setText("");
    let accumulatedResponse = "";

    try {
      setLoading(true);

      const history = [
        ...messages,
        {
          role: "user",
          content: prompt,
        },
      ].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      await sendMessageStream(conversationId!, history, (message) => {
        accumulatedResponse += message;
        updateMessage(assistantMessageId, accumulatedResponse);
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ask anything..."
        className="flex-1 rounded-lg border px-4 py-2"
      />

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {isLoading ? "Thinking..." : "Send"}
      </button>
    </div>
  );
};
