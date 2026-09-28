import { useChatStore } from "../../stores/chat.store";
import { ConversationItem } from "./ConversationItem";
import { NewChatButton } from "./NewChatButton";

export function Sidebar() {
  const conversations = useChatStore((state) => state.conversations);

  return (
    <aside className="flex w-72 flex-col border-r bg-white">
      <div className="border-b p-4">
        <NewChatButton />
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">No conversations yet.</p>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation, index) => (
              <ConversationItem
                key={`${conversation._id}-${index}`}
                conversation={conversation}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
