import { createConversation, getConversations } from "../api/conversation";

import { useEffect } from "react";
import { useChatStore } from "../stores/chat.store";

export function useChat() {
  const setConversations = useChatStore((state) => state.setConversations);

  const setMessages = useChatStore((state) => state.setMessages);

  const setActiveConversation = useChatStore(
    (state) => state.setActiveConversation,
  );

  useEffect(() => {
    async function initialize() {
      const conversations = await getConversations();

      setConversations(conversations);

      if (conversations.length > 0) {
        setActiveConversation(conversations[0]._id);

        setMessages(conversations[0].messages);

        return;
      }

      const conversation = await createConversation();

      setConversations([conversation]);

      setMessages([]);

      setActiveConversation(conversation._id);
    }

    initialize();
  }, []);
}
