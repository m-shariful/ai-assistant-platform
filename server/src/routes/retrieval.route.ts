import { Router } from "express";
import { RetrievalService } from "../services/retrieval.service.js";

const router = Router();

router.get("/search", async (req, res) => {
  try {
    const { query, limit = "2" } = req.query;

    if (!query || typeof query !== "string" || query.trim() === "") {
      return res
        .status(400)
        .json({ error: "Missing or invalid 'query' parameter" });
    }

    if (!limit || typeof limit !== "string") {
      return res
        .status(400)
        .json({ error: "Missing or invalid 'limit' parameter" });
    }

    const results = await RetrievalService.search(query, parseInt(limit));
    return res.status(200).json({ results });
  } catch (error) {
    console.error("Retrieval ERROR:", error);
    return res.status(500).json({ error: "Failed to search knowledge." });
  }
});

router.get("/debug", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        error: "Query is required",
      });
    }

    const results = await RetrievalService.debugSearch(query);

    return res.json({
      query,
      results,
    });
  } catch (error) {
    console.error("Retrieval debug ERROR:", error);

    return res.status(500).json({
      error: "Failed to debug retrieval",
    });
  }
});

export default router;
