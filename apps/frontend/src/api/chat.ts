import { apiFetch } from "@/api/auth"

export interface CreateTaskInput {
  prompt: string
  installationId: string
  /** Repository owner, e.g. `anuzx`. */
  owner: string
  repo: string
}

export interface CreateTaskResult {
  jobId?: string
  message?: string
}

/** Queues an agent run for a repository. Requires a signed-in user. */
export function createTask(input: CreateTaskInput) {
  return apiFetch<CreateTaskResult>("/api/v1/tasks", {
    method: "POST",
    body: input,
    auth: true,
  })
}