import { useEffect, useRef } from "react";

import { useChatStore } from "../../stores/chat.store";
import { ChatMessage } from "./ChatMessage";

export const ChatWindow = () => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const messages = useChatStore((state) => state.messages);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      ref={bottomRef}
      className="h-125 overflow-y-auto rounded-lg border bg-white p-4 shadow"
    >
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
    </div>
  );
};
