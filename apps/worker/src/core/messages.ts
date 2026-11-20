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
      content: `You are a coding agent working inside a sandbox.

The repository workspace is: ${workspace}

Complete the user's task by editing files in that workspace.

Rules:
- Inspect the repository before changing anything.
- Make the smallest correct change that fully satisfies the task.
- Run relevant tests or checks when possible.
- Do NOT run \`git commit\`, \`git push\`, or \`gh\`. The harness commits,
  pushes, and opens the pull request for you.
- Never paste raw command output or tool results into your final answer.

When you are finished, reply with this exact Markdown structure:

## Summary
<1-3 sentences describing what changed and why>

## Changes
- <path>: <what changed>

## Verification
<commands you ran and their result, or "not run">`,
    },
    {
      role: "user",
      content: prompt,
    },
  ];
}
