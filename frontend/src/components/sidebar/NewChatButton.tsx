import { createConversation } from "../../api/conversation";
import { useChatStore } from "../../stores/chat.store";

export function NewChatButton() {
  const conversations = useChatStore((state) => state.conversations);

  const setConversations = useChatStore((state) => state.setConversations);

  const setActiveConversation = useChatStore(
    (state) => state.setActiveConversation,
  );

  const setMessages = useChatStore((state) => state.setMessages);

  const handleCreateConversation = async () => {
    try {
      const conversation = await createConversation();

      setConversations([conversation, ...conversations]);

      setActiveConversation(conversation._id);

      setMessages([]);
    } catch (error) {
      console.error("Failed to create conversation", error);
    }
  };

  return (
    <button
      onClick={handleCreateConversation}
      className="
        w-full
        rounded-lg
        bg-blue-600
        px-4
        py-3
        font-medium
        text-white
        transition-colors
        hover:bg-blue-700
      "
    >
      + New Chat
    </button>
  );
}
