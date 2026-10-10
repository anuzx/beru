import type { ChatFunctionTool, ChatMessages } from "@openrouter/sdk/models";
import { baseTools } from "./baseTools";
import { runAgent } from "../core/agent";

export const subAgentTool: ChatFunctionTool = {
  type: "function",
  function: {
    name: "sub_agent",
    description:
      "Delegate a difficult, self-contained task (deep investigation, multi-step analysis, tracing logic across many files) to a sub-agent. The sub-agent has its own fresh context and the same bash/read_file tools, but cannot see this conversation, so describe the task and any relevant context fully. Returns the sub-agent's final report.",
    parameters: {
      type: "object",
      properties: {
        task: {
          type: "string",
          description:
            "A complete, standalone description of what the sub-agent should do and what it should report back.",
        },
      },
      required: ["task"],
    },
  },
};

// the sub-agent only gets the base tools, so it can't spawn sub-agents of its own


async function runSubAgent(task: string) {
  const subMessages: ChatMessages[] = [
    {
      role: "system",
      content: `You are a sub-agent of a coding agent, running inside a sandbox. You have been delegated one specific task. Use the bash and read_file tools to complete it thoroughly. The working directory is ${REPO_PATH}. When you are done, reply with a complete, self-contained report of your findings or results - it is the only thing the main agent will see.`,
    },
    {
      role: "user",
      content: task,
    },
  ];

  const result = await runAgent(subMessages, baseTools, 30, "sub-agent");
  console.log("[sub-agent] Done");
  return result ?? "The sub-agent did not produce a result.";
}

export {runSubAgent}