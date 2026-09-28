import cors from "cors";
import express from "express";
import { logger } from "./middleware/logger.js";
import chatStreamRouter from "./routes/chat-stream.route.js";
import chatRouter from "./routes/chat.route.js";
import conversationsRouter from "./routes/conversations.route.js";
import embeddingRouter from "./routes/embedding.route.js";
import evaluationRouter from "./routes/evaluation.route.js";
import knowledgeRouter from "./routes/knowledge.route.js";
import retrivalRouter from "./routes/retrieval.route.js";

const app = express();

app.use(cors());

app.use(express.json());

app.use(logger);

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
  });
});

app.use("/chat", chatRouter);
app.use("/chat-stream", chatStreamRouter);
app.use("/conversations", conversationsRouter);
app.use("/embeddings", embeddingRouter);
app.use("/knowledge", knowledgeRouter);
app.use("/retrieval", retrivalRouter);
app.use("/evaluation", evaluationRouter);

export default app;
