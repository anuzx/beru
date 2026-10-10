import type {
  ChatFunctionTool,
  ChatMessages,
  ChatToolCall,
} from "@openrouter/sdk/models";
import { baseTools, runBash } from "./baseTools";
import { runSubAgent, subAgentTool } from "./subagent";

export const mainTools: ChatFunctionTool[] = [...baseTools, subAgentTool];

async function getToolResponse(toolCall: ChatToolCall): Promise<ChatMessages> {
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
        toolResult = await runSubAgent(task);
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
}

export { getToolResponse };
