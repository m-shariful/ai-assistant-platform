import type { RetrievedKnowledge } from "./retrieval.service.js";

export class RAGContextService {
  private static readonly MAX_CONTEXT_LENGTH = 12000; // Max context length

  static buildContext(results: RetrievedKnowledge[]): string {
    if (!results.length) {
      return "";
    }

    const uniqueResults = this.removeDuplicates(results);

    let currentLength = 0;
    const source: string[] = [];

    for (const [index, result] of uniqueResults.entries()) {
      // Preserve document metadata
      const title = result.document?.title || "Unknown Title";
      const sourceName = result.document?.source || "Unknown Source";

      const chunkText = [
        `[Source ${index + 1}]`,
        `Title: ${title}`,
        `Source: ${sourceName}`,
        // `Relevance Score: ${result.score.toFixed(3)}`,
        "",
        result.content,
      ].join("\n");

      if (currentLength + chunkText.length > this.MAX_CONTEXT_LENGTH) {
        break;
      }

      currentLength += chunkText.length;
      source.push(chunkText);
    }

    return source.join("\n\n");
  }

  private static removeDuplicates(
    results: RetrievedKnowledge[],
  ): RetrievedKnowledge[] {
    const seenContents = new Set<string>();
    return results.filter((result) => {
      const key = result.chunkId || result.content.trim();
      if (seenContents.has(key)) {
        return false;
      }
      seenContents.add(key);
      return true;
    });
  }
}
