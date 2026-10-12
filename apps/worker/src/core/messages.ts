import type { ChatMessages } from "@openrouter/sdk/models";

type CreateMessagesOptions = {
  prompt: string;
  workspace: string;
};

export function createMessages({
  prompt,
  workspace,
}: CreateMessagesOptions): ChatMessages[] {
  return [
    {
      role: "system",
      content: `You are a coding agent.
The repository workspace is: ${workspace}
Inspect the code before modifying it.
Make the requested changes and run relevant tests.
Do not claim success without verifying the result.`,
    },
    {
      role: "user",
      content: prompt,
    },
  ];
}