import type { Sandbox } from "e2b";
import { buildCloneUrl } from "@repo/github";

type Identity = { name: string; email: string };

export async function setupRepo(
  sbx: Sandbox,
  args: {
    owner: string;
    repo: string;
    token: string;
    workspace: string;
    branch: string;
    identity: Identity;
  },
) {
  const { owner, repo, token, workspace, branch, identity } = args;

  await sbx.commands.run(
    `git clone ${buildCloneUrl(token, owner, repo)} ${workspace}`,
  );
  await sbx.commands.run(`git -C ${workspace} checkout -b ${branch}`);
  await sbx.commands.run(
    `git -C ${workspace} config user.name ${JSON.stringify(identity.name)}`,
  );
  await sbx.commands.run(
    `git -C ${workspace} config user.email ${JSON.stringify(identity.email)}`,
  );
}

export async function commitAndPush(
  sbx: Sandbox,
  workspace: string,
  branch: string,
  message: string,
) {
  await sbx.commands.run(`git -C ${workspace} add -A`);
  await sbx.commands.run(
    `git -C ${workspace} commit -m ${JSON.stringify(message)} || true`,
  );
  await sbx.commands.run(`git -C ${workspace} push -u origin ${branch}`);
}
