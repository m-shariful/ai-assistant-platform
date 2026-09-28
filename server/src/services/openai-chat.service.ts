import type { Response } from "express";
import { OpenAIAdapter } from "../adapters/openai.adapter.js";
import type { ChatMessage } from "../types/chat.js";
import { openAIService } from "./openai.service.js";

/**
 * Responsible for:
 * calling Responses API
 * [+] streaming
 * [+] retries (later)
 * [+] temperature
 * [+] model selection
 * [+] tools (later)
 * [+] structured outputs (later)
 **/
export class OpenAIChatService {
  static async chat(messages: ChatMessage[]): Promise<string> {
    const input = OpenAIAdapter.toResponsesInput(messages);

    const response = await openAIService.getClient().responses.create({
      model: "gpt-5-mini",
      input,
    });

    return response.output_text;
  }

  static async stream(messages: ChatMessage[], res: Response): Promise<string> {
    const input = OpenAIAdapter.toResponsesInput(messages);

    const stream = await openAIService.getClient().responses.stream({
      model: "gpt-5-mini",
      input,
    });

    let assistantResponse = "";

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    for await (const event of stream) {
      if (event.type === "response.output_text.delta") {
        assistantResponse += event.delta;
        res.write(event.delta);
      }
    }

    res.end();

    return assistantResponse;
  }
}
