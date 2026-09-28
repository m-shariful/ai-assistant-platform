import crypto from "node:crypto";
import type { Chunk } from "../types/chunk.js";

export class ChunkService {
  static split(document: string): Chunk[] {
    return document
      .split(/\n\s*\n/) // split on blank lines
      .map((text) => text.trim())
      .filter(Boolean)
      .map((content, index) => ({
        id: crypto.randomUUID(),
        content,
        index,
      }));
  }
}
