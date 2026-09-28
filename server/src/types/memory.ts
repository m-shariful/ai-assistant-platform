export interface MemoryItem {
  /**
   * Unique memory identifier.
   * Example:
   * favorite_language
   */
  key: string;

  /**
   * Stored value.
   * Example:
   * TypeScript
   */
  value: string;

  /**
   * Importance score (1-10)
   */
  importance: number;
}
