import { Worker } from "bullmq";
import { redisConnection, type AgentJob } from "@repo/common";
import { runJob } from "./job";

const worker = new Worker<AgentJob>("agent-queue", (job) => runJob(job), {
  connection: redisConnection,
  concurrency: 2,
});

worker.on("completed", (job) => {
  console.log(`Job ${job.id} has completed!`);
});

worker.on("failed", (job, err) => {
  console.log(`Job ${job?.id} has failed with ${err.message}`);
});
