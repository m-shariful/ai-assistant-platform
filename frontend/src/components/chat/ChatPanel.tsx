import { ChatInput } from "./ChatInput";
import { ChatWindow } from "./ChatWindow";

export function ChatPanel() {
  return (
    <div className="flex h-full flex-col">
      <ChatWindow />

      <div className="border-t p-4">
        <ChatInput />
      </div>
    </div>
  );
}
