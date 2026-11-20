import type { Sandbox } from "e2b";
import { buildCloneUrl } from "@repo/github";
import { redact, runCommand } from "./tools/exec";

type Identity = { name: string; email: string };

type SetupArgs = {
  owner: string;
  repo: string;
  token: string;
  workspace: string;
  branch: string;
  identity: Identity;
};

type PushArgs = {
  workspace: string;
  branch: string;
  message: string;
  base: string;
  pushUrl: string;
  token: string;
};

export async function setupRepo(sbx: Sandbox, args: SetupArgs) {
  const { owner, repo, token, workspace, branch, identity } = args;
  const cloneUrl = buildCloneUrl(token, owner, repo);
  const cleanUrl = `https://github.com/${owner}/${repo}.git`;

  console.log("cloning repository...");
  const clone = await runCommand(
    sbx,
    `git clone ${JSON.stringify(cloneUrl)} ${JSON.stringify(workspace)}`,
  );

  if (clone.exitCode !== 0) {
    throw new Error(
      `git clone failed (exit ${clone.exitCode}): ${redact(clone.stderr || clone.stdout, token)}`,
    );
  }

  // Never leave the installation token in .git/config where the agent could
  // read it and send it to the model.
  await runCommand(
    sbx,
    `git -C ${JSON.stringify(workspace)} remote set-url origin ${JSON.stringify(cleanUrl)}`,
  );

  console.log(`creating branch ${branch}...`);
  const checkout = await runCommand(
    sbx,
    `git -C ${JSON.stringify(workspace)} checkout -b ${JSON.stringify(branch)}`,
  );

  if (checkout.exitCode !== 0) {
    throw new Error(
      `git checkout failed (exit ${checkout.exitCode}): ${checkout.stderr || checkout.stdout}`,
    );
  }

  console.log("configuring git identity...");
  await runCommand(
    sbx,
    `git -C ${JSON.stringify(workspace)} config user.name ${JSON.stringify(identity.name)}`,
  );
  await runCommand(
    sbx,
    `git -C ${JSON.stringify(workspace)} config user.email ${JSON.stringify(identity.email)}`,
  );
}

export async function commitAndPush(sbx: Sandbox, args: PushArgs) {
  const { workspace, branch, message, base, pushUrl, token } = args;
  const repoDir = JSON.stringify(workspace);

  console.log("staging changes...");
  await runCommand(sbx, `git -C ${repoDir} add -A`);

  console.log("committing changes...");
  await runCommand(sbx, `git -C ${repoDir} commit -m ${JSON.stringify(message)}`);

  const count = await runCommand(
    sbx,
    `git -C ${repoDir} rev-list --count ${JSON.stringify(`origin/${base}..HEAD`)}`,
  );
  const commitCount = Number.parseInt(count.stdout.trim(), 10);

  if (count.exitCode !== 0 || Number.isNaN(commitCount) || commitCount === 0) {
    throw new Error(
      "Agent produced no file changes; nothing to open a pull request for.",
    );
  }

  console.log(`pushing branch ${branch}...`);
  const push = await runCommand(
    sbx,
    `git -C ${repoDir} push ${JSON.stringify(pushUrl)} ${JSON.stringify(branch)}`,
  );

  if (push.exitCode !== 0) {
    throw new Error(
      `git push failed (exit ${push.exitCode}): ${redact(push.stderr || push.stdout, token)}`,
    );
  }
}
