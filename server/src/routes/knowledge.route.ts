import { Router } from "express";
import { KnowledgeService } from "../services/knowledge.service.js";

const router = Router();

router.post("/ingest", async (req, res) => {
  try {
    const { title, source, document } = req.body;

    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "Title is required" });
    }

    if (!document || typeof document !== "string") {
      return res.status(400).json({ error: "Document is required" });
    }

    await KnowledgeService.ingest(title, document, source);
    return res
      .status(200)
      .json({ status: "ok", message: "Document ingested successfully" });
  } catch (error) {
    console.error("Knowledge ingestion ERROR:", error);
    return res.status(500).json({ error: "Failed to ingest document" });
  }
});

export default router;
