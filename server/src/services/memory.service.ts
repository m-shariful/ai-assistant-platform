// Later we'll move to semantic memory using embeddings.
// and it Key-Value pairs, because it's simple to understand.

import { Memory } from "../models/memory.model.js";

// stores data
export class MemoryService {
  // Save a new memory
  static async saveMemory(
    userId: string,
    key: string,
    value: string,
    importance: number = 5,
  ) {
    // Save memory to database
    const memory = await Memory.create({ userId, key, value, importance });
    return memory;
  }

  // Retrieve memories for a user
  static async getUserMemories(userId: string) {
    const memories = await Memory.find({ userId }).sort({
      importance: -1,
      updatedAt: -1,
    });
    return memories;
  }

  // Find a specific memory by key for a user
  static async findMemory(userId: string, key: string) {
    const memory = await Memory.findOne({ userId, key });
    return memory;
  }

  // Update a memory's value and importance
  static async updateMemory(
    userId: string,
    key: string,
    value: string,
    importance?: number,
  ) {
    const update: Record<string, unknown> = { value, updatedAt: new Date() };
    if (importance) update.importance = importance;

    const memory = await Memory.findOneAndUpdate({ userId, key }, update, {
      new: true,
    });
    return memory;
  }

  // Save or Update memory (Upsert)
  static async saveOrUpdateMemory(
    userId: string,
    key: string,
    value: string,
    importance: number = 5,
  ) {
    const existingMemory = await this.findMemory(userId, key);

    console.log(`Checking if memory exists for userId: ${userId}, key: ${key}`);

    if (existingMemory) {
      return await this.updateMemory(userId, key, value, importance);
    }

    return await this.saveMemory(userId, key, value, importance);
  }
}
