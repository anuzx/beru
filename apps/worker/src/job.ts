import type { Job } from "bullmq";
import {
  buildCloneUrl,
  createInstallationToken,
  createPullRequest,
  getAppBotIdentity,
  getRepoDefaultBranch,
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
import {
  buildBranchName,
  buildPrBody,
  buildPrTitle,
  detectBranchType,
  getChangeSummary,
} from "./pull_request";

export async function runJob(job: Job<AgentJob>) {
  const { owner, repo, installationId, prompt } = job.data;
  const jobId = job.id ?? "unknown";

  console.log("starting sandbox...");
  const sbx = await createSandbox();
  console.log("sandbox started");

  let token: string | undefined;

  try {
    console.log("loading github app...");
    const app = await loadGithubApp();

    console.log("creating installation token...");
    ({ token } = await createInstallationToken(app, installationId, repo));

    console.log("looking up app bot identity...");
    const identity = await getAppBotIdentity(app, token);

    const branchType = detectBranchType(prompt);
    const branch = buildBranchName(prompt, jobId);
    console.log(`using branch ${branch}`);

    const base = await getRepoDefaultBranch(token, owner, repo);
    console.log(`base branch is ${base}`);

    console.log(`cloning ${owner}/${repo}...`);
    await setupRepo(sbx, {
      owner,
      repo,
      token,
      workspace: WORKSPACE,
      branch,
      identity,
    });
    console.log("repository ready");

    console.log("running agent...");
    const ctx = createToolContext(sbx, WORKSPACE);
    const messages = createMessages({ prompt, workspace: WORKSPACE });
    const report = await runAgent(messages, ctx, MAX_ITERATIONS, "main");
    console.log("agent finished");

    console.log("committing and pushing changes...");
    await commitAndPush(sbx, {
      workspace: WORKSPACE,
      branch,
      message: `Agent changes for job ${jobId}`,
      base,
      pushUrl: buildCloneUrl(token, owner, repo),
      token,
    });
    console.log("changes pushed");

    console.log("collecting change summary...");
    const changes = await getChangeSummary(sbx, WORKSPACE, base);

    console.log("creating pull request...");
    const pr = await createPullRequest(token, owner, repo, {
      title: buildPrTitle({ prompt, report, type: branchType }),
      head: branch,
      base,
      body: buildPrBody({
        prompt,
        report,
        ...changes,
        branch,
        jobId,
      }),
    });
    console.log(`pull request created: ${pr.htmlUrl}`);

    return { prUrl: pr.htmlUrl, branch };
  } finally {
    console.log("cleaning up...");

    if (token) {
      await revokeInstallationToken(token).catch((error) => {
        console.error(
          "failed to revoke installation token:",
          error instanceof Error ? error.message : error,
        );
      });
    }

    await sbx.kill();
  }
}
