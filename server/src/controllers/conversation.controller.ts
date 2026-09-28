import type { Request, Response } from "express";

import { ConversationService } from "../services/conversation.service.js";

export class ConversationController {
  // Create a new conversation
  static async create(req: Request, res: Response) {
    try {
      const conversation =
        await ConversationService.createConversation("New Conversation");
      return res.status(200).json(conversation);
    } catch (error) {
      console.error("ERROR:", error);
      return res.status(500).json({ error: "Failed to create conversation" });
    }
  }

  // Get all conversations
  static async getAll(req: Request, res: Response) {
    try {
      const conversations = await ConversationService.getAllConversations();
      return res.status(200).json(conversations);
    } catch (error) {
      console.error("ERROR:", error);
      return res.status(500).json({ error: "Failed to get conversations" });
    }
  }

  // Get a conversation by ID
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id || Array.isArray(id)) {
        return res.status(400).json({ error: "Invalid conversation id" });
      }

      const conversation = await ConversationService.getConversationById(id);
      return res.status(200).json(conversation);
    } catch (error) {
      console.error("ERROR:", error);
      return res.status(500).json({ error: "Failed to get conversation" });
    }
  }
}
