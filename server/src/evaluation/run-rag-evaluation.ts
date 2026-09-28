import "dotenv/config";

import mongoose from "mongoose";
import { connectToDatabase } from "../config/db.js";
import { RAGEvaluator } from "./rag-evaluator.js";

try {
  await connectToDatabase();

  const results = await RAGEvaluator.run();

  console.table(results);

  const passed = results.filter((result) => result.passed).length;

  console.log(`\nRAG Evaluation: ${passed}/${results.length} passed`);
} catch (error) {
  console.error("RAG evaluation failed:", error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
