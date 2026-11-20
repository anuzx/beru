import { CommandExitError, type Sandbox } from "e2b";
import { MAX_OUTPUT_CHARS } from "../../constants";

export type ExecResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

function truncate(value: string | undefined) {
  const text = value ?? "";

  return text.length > MAX_OUTPUT_CHARS
    ? `${text.slice(0, MAX_OUTPUT_CHARS)}\n...[output truncated]`
    : text;
}

// Keep secrets (for example the installation token embedded in a clone URL)
// out of error messages, job logs, and model conversations.
export function redact(text: string, secret: string | undefined) {
  if (!secret) {
    return text;
  }

  return text.split(secret).join("***");
}

export async function runCommand(
  sbx: Sandbox,
  command: string,
  options: { timeoutMs?: number } = {},
): Promise<ExecResult> {
  try {
    const result = await sbx.commands.run(command, options);

    return {
      exitCode: result.exitCode,
      stdout: truncate(result.stdout.toString()),
      stderr: truncate(result.stderr.toString()),
    };
  } catch (error) {
    if (error instanceof CommandExitError) {
      return {
        exitCode: error.exitCode,
        stdout: truncate(error.stdout),
        stderr: truncate(error.stderr),
      };
    }

    throw error;
  }
}
