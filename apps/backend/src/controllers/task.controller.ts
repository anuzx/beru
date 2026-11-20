import { agentQueue, TaskSchema } from "@repo/common";
import type { Context } from "elysia";

const handleQuery = async ({ body, set }: Context) => {
  const { data, success } = TaskSchema.safeParse(body);

  if (!success) {
    set.status = 400;
    return { message: "invalid input" };
  }

  const { prompt, owner, repo, installationId } = data;

  console.log("queueing task...");

  const job = await agentQueue.add("run-agent", {
    owner,
    repo,
    installationId,
    prompt,
  });

  console.log(`task queued: ${job.id}`);
  //append the repository link, status in db

  return { jobId: job.id, message: "queued..." };
};

export { handleQuery };
