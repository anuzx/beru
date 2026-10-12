import { z } from "zod";

export const TaskSchema = z.object({
  prompt: z.string().min(1).max(10_000),
  installationId: z.string(),
  owner: z.string().min(1),
  repo: z.string().min(1),
});

export type AgentJob = z.infer<typeof TaskSchema>;