import { Queue } from "bullmq";
import { redisConnection } from "./redis";

export const agentQueue = new Queue("agent-queue", {
  connection: redisConnection,
});