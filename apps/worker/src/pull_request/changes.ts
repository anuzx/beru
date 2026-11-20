import type { Sandbox } from "e2b";
import { runCommand } from "../tools/exec";

export type ChangeSummary = {
  stat: string;
  commits: string;
};

export async function getChangeSummary(
  sbx: Sandbox,
  workspace: string,
  base: string,
): Promise<ChangeSummary> {
  const range = `origin/${base}...HEAD`;
  const stat = await runCommand(
    sbx,
    `git -C ${JSON.stringify(workspace)} diff --stat ${JSON.stringify(range)}`,
  );
  const commits = await runCommand(
    sbx,
    `git -C ${JSON.stringify(workspace)} log --oneline ${JSON.stringify(range)}`,
  );

  return {
    stat: stat.exitCode === 0 ? stat.stdout.trim() : "",
    commits: commits.exitCode === 0 ? commits.stdout.trim() : "",
  };
}
