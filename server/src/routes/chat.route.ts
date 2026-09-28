import { Router } from "express";
import { openAIService } from "../services/openai.service.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "message is required",
      });
    }

    const response = await openAIService.getClient().responses.create({
      model: "gpt-5-mini",
      input: message,
    });

    return res.status(200).json({
      answer: response.output_text,
    });
  } catch (err: any) {
    console.error("ERROR:", err);

    return res.status(500).json({
      error: "Internal Server Error",
      message: err?.message,
    });
  }
});

export default router;
