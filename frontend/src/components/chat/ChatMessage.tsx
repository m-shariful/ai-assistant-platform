import ReactMarkdown from "react-markdown";
import type { Message } from "../../types/chat";

interface Props {
  message: Message;
}

export const ChatMessage = ({ message }: Props) => {
  const isUser = message.role === "user";

  return (
    <div className={`mb-4 flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser ? "bg-blue-600 text-white" : "bg-slate-200 text-black"
        }`}
      >
        <ReactMarkdown>{message.content}</ReactMarkdown>
      </div>
    </div>
  );
};
