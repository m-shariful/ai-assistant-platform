import { getConversation } from "../../api/conversation";
import { useChatStore } from "../../stores/chat.store";
import type { Conversation } from "../../types/conversation";

interface ConversationItemProps {
  conversation: Conversation;
}

export function ConversationItem({ conversation }: ConversationItemProps) {
  const activeConversationId = useChatStore(
    (state) => state.activeConversationId,
  );

  const setActiveConversation = useChatStore(
    (state) => state.setActiveConversation,
  );

  const setMessages = useChatStore((state) => state.setMessages);

  const handleClick = async () => {
    try {
      const selectedConversation = await getConversation(conversation._id);

      setActiveConversation(selectedConversation._id);

      setMessages(selectedConversation.messages);
    } catch (error) {
      console.error("Failed to load conversation", error);
    }
  };

  const isActive = activeConversationId === conversation._id;

  return (
    <button
      onClick={handleClick}
      className={`
        w-full
        cursor-pointer
        rounded-lg
        p-3
        text-left
        transition-colors
        hover:bg-slate-100
        ${isActive ? "bg-slate-200 font-semibold" : ""}
      `}
    >
      <div className="truncate">{conversation.title}</div>

      <div className="mt-1 text-xs text-gray-500">
        {new Date(conversation.updatedAt).toLocaleString()}
      </div>
    </button>
  );
}
