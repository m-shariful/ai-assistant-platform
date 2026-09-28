import { Router } from "express";
import { EmbeddingService } from "../services/embedding.service.js";

const router = Router();

router.get("/", async (req, res) => {
  const { text } = req.query;
  const embedding = await EmbeddingService.createEmbedding(
    (text as string) || "I love TypeScript",
  );
  return res.status(200).json({
    dimension: embedding.length,
    firstTen: embedding.slice(0, 10),
  });
});

export default router;
