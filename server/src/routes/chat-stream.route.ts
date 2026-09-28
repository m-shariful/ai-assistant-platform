import { Router } from "express";
import { ChatService } from "../services/chat.service.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { conversationId, messages } = req.body;
    await ChatService.streamConversation(conversationId, messages, res);
  } catch (err: any) {
    console.error("ERROR:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

export default router;
