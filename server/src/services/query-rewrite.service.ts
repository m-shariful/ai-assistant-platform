import { openAIService } from "./openai.service.js";

// It makes a request to the OpenAI API to rewrite a query into a conversation-aware RAG.
// It's a query clarification layer, not a query enrichment layer.
export class QueryRewriteService {
  static async rewrite(
    messages: { role: "user" | "assistant"; content: string }[],
  ): Promise<string> {
    const conversation = messages
      .map((message) => `${message.role}: ${message.content}`)
      .join("\n");

    const response = await openAIService.getClient().responses.create({
      model: "gpt-5-mini",
      input: [
        {
          role: "system",
          content: `
            You rewrite conversational user questions into standalone search queries.

            Your job is ONLY to resolve ambiguity in the latest user question
            so it can be used for semantic knowledge retrieval.

            Rules:
            - Resolve pronouns and references such as "it", "this", "that", "they", etc.
            using the conversation.
            - Preserve the user's original intent.
            - Include entities explicitly established in the conversation when needed
            to make the query standalone.
            - Do NOT introduce new concepts, technologies, methods, facts, or terminology
            that were not present in the conversation.
            - Do NOT infer a specific implementation, API, Hook, library, or mechanism
            unless it was explicitly mentioned in the conversation.
            - Do NOT answer the question.
            - Do NOT expand the scope of the question.
            - If the latest question is already standalone, return it unchanged.
            - Return ONLY the rewritten query.

            - Detect topic switches.
            - If the latest user message introduces a new entity or subject
            that is not clearly a follow-up to the previous topic, treat it
            as a new query.
            - Do not combine the new topic with previous conversation topics.
            - Do not invent relationships between the new topic and previous topics.
            - A short question such as "What about MongoDB?" should remain focused
            on MongoDB if MongoDB represents a new topic.

            - Preserve the user's wording and intent whenever possible.
            - Only rewrite when necessary to resolve ambiguity or references.
            - If the latest message is already understandable as a standalone
            retrieval query, return it unchanged.
            - Do not turn short queries such as "What about MongoDB?" into
            broader questions such as "What information is available about MongoDB?"
            - Do not add intent, scope, relationships, or concepts that the user
            did not express.

            Examples:

            Conversation:
            user: What is React state?
            user: How does it change?

            Output:
            How does React state change?

            Conversation:
            user: What is useEffect?
            user: What does it synchronize with?

            Output:
            What does useEffect synchronize with?

            Conversation:
            user: What are React Hooks?
            user: How do they work?

            Output:
            How do React Hooks work?
          `.trim(),
        },
        {
          role: "user",
          content: conversation,
        },
      ],
    });

    return response.output_text.trim();
  }
}
