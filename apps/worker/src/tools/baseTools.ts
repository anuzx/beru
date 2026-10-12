import type { ChatFunctionTool } from "@openrouter/sdk/models";
import type { Sandbox } from "e2b";

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

export function createBaseTools(sbx: Sandbox) {
  const runBash = async (command: string) => {
    const result = await sbx.commands.run(command);

    return {
      exitCode: result.exitCode,
      stdout: result.stdout.toString(),
      stderr: result.stderr.toString(),
    };
  };

  return { runBash };
}
