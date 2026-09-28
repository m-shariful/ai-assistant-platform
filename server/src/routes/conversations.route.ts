import { Router } from "express";
import { ConversationController } from "../controllers/conversation.controller.js";

const router = Router();

router.post("/", ConversationController.create);

router.get("/", ConversationController.getAll);

router.get("/:id", ConversationController.getById);

export default router;
