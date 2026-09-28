import { z } from "zod";

export const MemorySchema = z.object({
  key: z.string(),
  value: z.string(),
  importance: z.number().min(1).max(10),
});

export const MemoryListSchema = z.array(MemorySchema);

export type Memory = z.infer<typeof MemorySchema>;
