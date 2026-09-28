import { Document } from "../models/document.model.js";
import { Knowledge } from "../models/knowledge.model.js";
import { ChunkService } from "./chunk.service.js";
import { EmbeddingService } from "./embedding.service.js";

export class KnowledgeService {
  static async ingest(
    title: string,
    document: string,
    source: string = "",
  ): Promise<void> {
    // 1. Validate the document
    if (!document.trim()) {
      throw new Error("Document content cannot be empty.");
    }

    // 2. Create the parent document
    const createdDocument = await Document.create({ title, source });

    try {
      // 2. Split the document
      const chunks = ChunkService.split(document);

      if (!chunks.length) {
        throw new Error("Document chunking produced no chunks.");
      }

      // 3. Extract Texts from chunks
      const texts = chunks.map((chunk) => chunk.content);

      // 4. Process all chunks at once (makes one API request for all chunks)
      const embeddings = await EmbeddingService.createEmbeddings(texts);

      // 5. Validate embedding count; Make sure the number of embeddings matches the number of chunks
      if (embeddings.length !== chunks.length) {
        throw new Error("Embedding count mismatch with chunks count.");
      }

      // 6. Build knowledge entries
      const knowledgeEntries = chunks.map((chunk, index) => ({
        chunkId: chunk.id,
        documentId: createdDocument._id,
        content: chunk.content,
        embedding: embeddings[index],
        index: chunk.index,
      }));

      // 7. Save it all at once (bulk insert)
      await Knowledge.insertMany(knowledgeEntries);
    } catch (error) {
      // Roll back the parent document if ingestion fails
      await Document.findByIdAndDelete(createdDocument._id);

      throw error;
    }
  }
}
