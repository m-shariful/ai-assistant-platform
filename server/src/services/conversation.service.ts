import { Conversation } from "../models/conversation.model.js";

export class ConversationService {
  static async createConversation(title: string) {
    const conversation = await Conversation.create({ title });
    return conversation;
  }

  static async getAllConversations() {
    const conversations = await Conversation.find({}).sort({ updatedAt: -1 });
    return conversations;
  }

  static async getConversationById(id: string) {
    const conversation = await Conversation.findById(id);
    return conversation;
  }

  static async addMessageToConversation(
    conversationId: string,
    role: "user" | "assistant",
    content: string,
  ) {
    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      {
        $push: { messages: { role, content } },
        $set: { updatedAt: new Date() },
      },
      { new: true },
    );
    return conversation;
  }
}
