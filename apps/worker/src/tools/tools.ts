import type {
  ChatFunctionTool,
  ChatMessages,
  ChatToolCall,
} from "@openrouter/sdk/models";
import type { Sandbox } from "e2b";
import { baseTools, createBaseTools } from "./baseTools";
import { runSubAgent, subAgentTool } from "./subagent";

export type ToolContext = {
  tools: ChatFunctionTool[];
  runBash: (command: string) => Promise<{
    exitCode: number;
    stdout: string;
    stderr: string;
  }>;
  workspace: string;
  getToolResponse: (toolCall: ChatToolCall) => Promise<ChatMessages>;
};

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
      let timer: ReturnType<typeof setTimeout>;

      const timeout = new Promise((resolve) => {
        timer = setTimeout(() => {
          console.log("timeout received");
          resolve({ stdout: "Timeout while running the tool" });
        }, 30000);
      });

      try {
        let toolResult;

        switch (toolCall.function.name) {
          case "bash": {
            const { command } = JSON.parse(toolCall.function.arguments) as {
              command: string;
            };

            toolResult = await Promise.race([runBash(command), timeout]);
            break;
          }
          case "sub_agent": {
            const { task } = JSON.parse(toolCall.function.arguments) as {
              task: string;
            };
            console.log(`Tool: SubAgent > ${task}`);
            toolResult = await runSubAgent(task, ctx);
            break;
          }
          default:
            throw new Error(`Unknown tool: ${toolCall.function.name}`);
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
