import type {
  ChatFunctionTool,
  ChatMessages,
  ChatToolCall,
} from "@openrouter/sdk/models";
import { sbx } from "../safety/sandbox";

export const baseTools: ChatFunctionTool[] = [
  {
    type: "function",
    function: {
      name: "bash",
      description: "",
      parameters: {
        type: "object",
        properties: {
          command: {
            type: "string",
          },
        },
        required: ["command"],
      },
    },
  },
];

export const runBash = async (command: string) => {
  const result = await sbx.commands.run(command)

  return {
    exitCode: result.exitCode,
    stdout: result.stdout.toString(),
    stderr: result.stderr.toString(),
  };
};


