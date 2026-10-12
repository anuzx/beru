import type { Job } from "bullmq";
import {
  createInstallationToken,
  getAppBotIdentity,
  getRepoDefaultBranch,
  createPullRequest,
  revokeInstallationToken,
} from "@repo/github";
import type { AgentJob } from "@repo/common";
import { loadGithubApp } from "../config";
import { MAX_ITERATIONS, WORKSPACE } from "../constants";
import { createSandbox } from "./safety/sandbox";
import { createToolContext } from "./tools/tools";
import { createMessages } from "./core/messages";
import { runAgent } from "./core/agent";
import { setupRepo, commitAndPush } from "./repo";

export async function runJob(job: Job<AgentJob>) {
  const { owner, repo, installationId, prompt } = job.data;

  const sbx = await createSandbox();
  const app = await loadGithubApp();
  const { token } = await createInstallationToken(app, installationId, repo);

  try {
    const identity = await getAppBotIdentity(app, token);
    const branch = `agent/${job.id}`;

    await setupRepo(sbx, {
      owner,
      repo,
      token,
      workspace: WORKSPACE,
      branch,
      identity,
    });

    const ctx = createToolContext(sbx, WORKSPACE);
    const messages = createMessages({ prompt, workspace: WORKSPACE });
    const result = await runAgent(messages, ctx, MAX_ITERATIONS, "main");

    await commitAndPush(sbx, WORKSPACE, branch, `Agent changes for job ${job.id}`);

    const base = await getRepoDefaultBranch(token, owner, repo);
    const pr = await createPullRequest(token, owner, repo, {
      title: `Agent: ${prompt.slice(0, 60)}`,
      head: branch,
      base,
      body: typeof result === "string" ? result : "Automated changes by the agent.",
    });

    return { prUrl: pr.htmlUrl, branch };
  } finally {
    await sbx.kill();
    await revokeInstallationToken(token);
  }
}
