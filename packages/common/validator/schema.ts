import { z } from "zod";

export const TaskSchema = z.object({
  prompt: z.string().min(1).max(10_000),
  installationId: z.coerce.string(),
  owner: z.string().min(1),
  repo: z.string().min(1),
});

export const SignupSchema = z.object({
  email: z.email(),
  username: z.string(),
  password: z.string(),
});

export const SigninSchema = SignupSchema.pick({
  email: true,
  password: true
})

export type AgentJob = z.infer<typeof TaskSchema>;
