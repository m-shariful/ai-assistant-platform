import { create } from "zustand";
import type { Message } from "../types/chat";
import type { Conversation } from "../types/conversation";

interface ChatStore {
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversation: (conversationId: string | null) => void;

  messages: Message[];
  isLoading: boolean;

  setConversations: (conversations: Conversation[]) => void;
  setMessages: (messages: Message[]) => void;

  addMessage: (message: Message) => void;
  updateMessage: (id: string, content: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  conversations: [],
  activeConversationId: null,

  messages: [],
  isLoading: false,

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setLoading: (loading) =>
    set({
      isLoading: loading,
    }),

  updateMessage: (id, content) =>
    set((state) => ({
      messages: state.messages.map((message) =>
        message.id === id ? { ...message, content } : message,
      ),
    })),

  setActiveConversation: (activeConversationId) =>
    set({ activeConversationId }),
  setConversations: (conversations) => set({ conversations }),
  setMessages: (messages) => set({ messages }),
}));
