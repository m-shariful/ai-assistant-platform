import type { Response } from "express";
import { PromptBuilder } from "../prompts/prompt-builder.js";
import type { ChatMessage } from "../types/chat.js";
import { ConversationService } from "./conversation.service.js";
import { MemoryPipelineService } from "./memory-pipeline.service.js";
import { OpenAIChatService } from "./openai-chat.service.js";
import { QueryRewriteService } from "./query-rewrite.service.js";
import { RAGContextService } from "./rag-context.service.js";
import { RerankingService } from "./reranking.service.js";
import { RetrievalService } from "./retrieval.service.js";

/**
 * Responsible for:
 * [+] conversation orchestration
 * [+] persistence
 * [+] prompt creation
 * [+] memory orchestration (coming soon)
 * [+] RAG orchestration (coming soon)
 * **** An Orchestrator is a service that coordinates multiple other services to achieve a specific goal.
 * **** In this case, the ChatService orchestrates the conversation flow, memory management, and prompt creation
 * **** for the chat application.
 **/
export class ChatService {
  // simple chat
  static async chat(message: string) {
    // Passing demo-user because we don't have authentication yet.
    const prompt = await PromptBuilder.build("demo-user", [
      { role: "user", content: message },
    ]);

    return OpenAIChatService.chat(prompt);
  }

  // stream chat
  static async streamConversation(
    conversationId: string,
    messages: ChatMessage[],
    res: Response,
  ) {
    if (!conversationId) {
      throw new Error("conversationId is required");
    }

    if (!messages.length) {
      throw new Error("messages are required");
    }

    const latestMessage = messages[messages.length - 1] as ChatMessage;

    // save the latest message to the conversation (original user message)
    await ConversationService.addMessageToConversation(
      conversationId,
      "user",
      latestMessage.content,
    );

    // Rewrite the conversational question into a standalone query for retrieval
    const retrievalQuery = await QueryRewriteService.rewrite(
      messages.map((message) => ({
        role: message.role as "user" | "assistant",
        content: message.content,
      })),
    );

    console.log("Retrieval query:", retrievalQuery);

    // Retrieve relevant knowledge/ Vector retrieval / Vector results
    const vectorResults = await RetrievalService.search(
      // latestMessage.content,
      retrievalQuery,
      4, // limit
    );

    console.log(
      "Vector results:",
      vectorResults.map((result) => ({
        content: result.content,
        score: result.score,
      })),
    );

    // Rerank retrieved knowledge
    const rerankedResults = await RerankingService.rerank(
      // latestMessage.content,
      retrievalQuery,
      vectorResults,
    );

    console.log(
      "Reranked results:",
      rerankedResults.map((result) => ({
        content: result.content,
        vectorScore: result.score,
        relevanceScore: result.relevanceScore,
      })),
    );

    // Convert retrieved knowledge into prompt context
    const knowledgeContext = RAGContextService.buildContext(rerankedResults);
    // const knowledgeContext = RAGContextService.buildContext(vectorResults);

    console.log("RAG context:", knowledgeContext);

    // Passing demo-user because we don't have authentication yet.
    const prompt = await PromptBuilder.build(
      "demo-user",
      messages,
      knowledgeContext,
    );

    // stream the assistant's response
    const assistantResponse = await OpenAIChatService.stream(prompt, res);

    // save the assistant's response to the conversation
    await ConversationService.addMessageToConversation(
      conversationId,
      "assistant",
      assistantResponse,
    );

    // save the latest message to the memory pipeline for processing
    await MemoryPipelineService.process("demo-user", latestMessage);
  }
}
