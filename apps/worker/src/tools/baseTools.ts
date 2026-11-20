import type { ChatFunctionTool } from "@openrouter/sdk/models";
import type { Sandbox } from "e2b";
import { runCommand } from "./exec";

export const baseTools: ChatFunctionTool[] = [
  {
    type: "function",
    function: {
      name: "bash",
      description: "Run a shell command and return its output.",
      parameters: {
        type: "object",
        properties: {
          command: {
            type: "string",
            description: "The shell command to run.",
          },
        },
        required: ["command"],
      },
    },
  },
];

export function createBaseTools(sbx: Sandbox) {
  const runBash = (command: string) => runCommand(sbx, command);

  return { runBash };
}
