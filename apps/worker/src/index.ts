import { Worker } from "bullmq";
import { messages, runAgent } from "./core/agent";
import { sbx } from "./safety/sandbox";
import { mainTools } from "./tools/tools";
import { redisConnection } from "@repo/common";

const worker = new Worker(
  "agent-queue",
  async (job) => {
    const response = await runAgent(messages, mainTools, 50, "main");

    console.log(response);
  },
  {
    connection: redisConnection,
    concurrency: 2,
  },
);

worker.on("completed", async (job) => {
  console.log(`Job ${job.id} has completed!`);
  await sbx.kill();
});

worker.on("failed", (job, err) => {
  console.log(`Job ${job?.id} has failed with ${err.message}`);
});
