import type {
  ChatMessages,
  ChatResult,
} from "@openrouter/sdk/models";
import { config } from "../../env";
import { MAX_CONTEXT_TOKENS } from "../../constants";
import { openRouter } from "../../config";
import { summarizeMessages } from "./summarize";
import type { ToolContext } from "../tools/tools";

async function callLLM(
  messages: ChatMessages[],
  ctx: ToolContext,
): Promise<ChatResult> {
  const result = await openRouter.chat.send({
    chatRequest: {
      model: config.model,
      tools: ctx.tools,
      messages,
      stream: false,
    },
  });

  if (!("choices" in result)) {
    throw new Error("Expected a non-streaminh response");
  }

  const choice = result.choices[0];

  if (!choice) {
    throw new Error("Expected the model to return a choice");
  }

  messages.push(choice.message);

  return result;
}

async function runAgent(
  messages: ChatMessages[],
  ctx: ToolContext,
  maxIterations: number,
  label: string,
) {
  let iterationCount = 0;

  while (iterationCount < maxIterations) {
    iterationCount++;
    const response = await callLLM(messages, ctx);
    const contextTokens =
      (response.usage?.promptTokens ?? 0) +
      (response.usage?.completionTokens ?? 0);
    console.log(
      `[${label}] Iteration ${iterationCount}: context ${contextTokens} tokens`,
    );
    const choice = response.choices[0];

    if (!choice) {
      throw new Error("Expected the model to return a choice");
    }

    const toolCalls = choice.message.toolCalls;

    if (!toolCalls || toolCalls.length === 0) {
      return choice.message.content;
    }

    for (const toolCall of toolCalls) {
      messages.push(await ctx.getToolResponse(toolCall));
    }

    if (contextTokens > MAX_CONTEXT_TOKENS) {
      await summarizeMessages(messages);
      console.log(messages);
    }
  }

  console.warn(`[${label}] Warning: Maximum iterations reached`);
  return messages[messages.length - 1]?.content;
}

export { callLLM, runAgent };
