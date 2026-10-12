import { agentQueue, TaskSchema } from "@repo/common";
import type { Context } from "elysia";

const handleQuery = async ({ body, set }: Context) => {
  const { data, success } = TaskSchema.safeParse(body);

  if (!success) {
    set.status = 400;
    return { message: "invalid input" };
  }

  const { prompt, owner, repo, installationId } = data;

  const job = await agentQueue.add("run-agent", {
    owner,
    repo,
    installationId,
    prompt,
  });

  return { jobId: job.id, message: "queued..." };
};

export { handleQuery };
