import type {
  ChatFunctionTool,
  ChatMessages,
  ChatToolCall,
} from "@openrouter/sdk/models";
import type { Sandbox } from "e2b";
import type { ExecResult } from "./exec";
import { baseTools, createBaseTools } from "./baseTools";
import { runSubAgent, subAgentTool } from "./subagent";

export type ToolContext = {
  tools: ChatFunctionTool[];
  runBash: (command: string) => Promise<ExecResult>;
  workspace: string;
  getToolResponse: (toolCall: ChatToolCall) => Promise<ChatMessages>;
};

const TOOL_TIMEOUT_MS = 30_000;

function preview(value: string, maxLength = 200) {
  const firstLine = value.split("\n")[0]?.trim() ?? value;

  return firstLine.length > maxLength
    ? `${firstLine.slice(0, maxLength)}...`
    : firstLine;
}

export function createToolContext(
  sbx: Sandbox,
  workspace: string,
): ToolContext {
  const { runBash } = createBaseTools(sbx);
  const tools = [...baseTools, subAgentTool];

  const ctx: ToolContext = {
    tools,
    runBash,
    workspace,
    async getToolResponse(toolCall: ChatToolCall): Promise<ChatMessages> {
      console.log(`tool call: ${toolCall.function.name}`);

      let timer: ReturnType<typeof setTimeout>;

      const timeout = new Promise<ExecResult>((resolve) => {
        timer = setTimeout(() => {
          console.log("tool timed out");
          resolve({
            exitCode: -1,
            stdout: "",
            stderr: `Timeout after ${TOOL_TIMEOUT_MS / 1000}s while running the tool`,
          });
        }, TOOL_TIMEOUT_MS);
      });

      try {
        let toolResult: unknown;

        switch (toolCall.function.name) {
          case "bash": {
            const { command } = JSON.parse(toolCall.function.arguments) as {
              command: string;
            };

            console.log(`bash: ${preview(command)}`);
            toolResult = await Promise.race([runBash(command), timeout]);
            break;
          }
          case "sub_agent": {
            const { task } = JSON.parse(toolCall.function.arguments) as {
              task: string;
            };

            console.log(`tool: SubAgent > ${preview(task)}`);
            toolResult = await runSubAgent(task, ctx);
            break;
          }
          default:
            throw new Error(`Unknown tool: ${toolCall.function.name}`);
        }

        if (
          toolResult &&
          typeof toolResult === "object" &&
          "exitCode" in toolResult
        ) {
          console.log(
            `tool finished: ${toolCall.function.name} (exit ${(toolResult as ExecResult).exitCode})`,
          );
        }

        return {
          role: "tool",
          toolCallId: toolCall.id,
          content: JSON.stringify(toolResult),
        };
      } finally {
        clearTimeout(timer!);
      }
    },
  };

  return ctx;
}
