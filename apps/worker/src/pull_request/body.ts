import type { BranchType } from "./branch";
import { detectBranchType } from "./branch";

type PrInput = {
  prompt: string;
  report?: unknown;
  type?: BranchType;
};

type PrBodyInput = PrInput & {
  stat?: string;
  commits?: string;
  branch?: string;
  jobId?: string | number;
};

const PR_INSTRUCTION_PREFIX =
  /^(?:please\s+)?(?:make|create|open|raise|submit)\s+(?:me\s+)?(?:a\s+)?(?:pr|pull\s+request)\s*(?:saying|that\s+says|with(?:\s+the)?\s+(?:title|message|body))?\s*:?\s*/i;

function contentToText(content: unknown): string | null {
  if (typeof content === "string") {
    return content;
  }

  if (!Array.isArray(content)) {
    return null;
  }

  const text = content
    .map((part) => {
      if (typeof part === "string") {
        return part;
      }

      if (part && typeof part === "object" && "text" in part) {
        const value = (part as { text?: unknown }).text;
        return typeof value === "string" ? value : "";
      }

      return "";
    })
    .join("\n")
    .trim();

  return text || null;
}

// The model sometimes echoes a tool result instead of writing a summary.
// Those must never end up in the pull request body.
function looksLikeToolOutput(text: string) {
  const trimmed = text.trim();

  return (
    /^[{[]/.test(trimmed) ||
    trimmed.includes('"exitCode"') ||
    trimmed.includes('"stdout"')
  );
}

function extractSummary(report: unknown): string | null {
  const text = contentToText(report);

  if (!text) {
    return null;
  }

  const cleaned = text.trim();

  if (!cleaned || looksLikeToolOutput(cleaned)) {
    return null;
  }

  const section = cleaned.match(
    /^#{1,3}\s*summary\s*\n+([\s\S]*?)(?=\n#{1,3}\s|\s*$)/i,
  );
  const summary = (section?.[1] ?? cleaned).trim();

  if (!summary || looksLikeToolOutput(summary)) {
    return null;
  }

  return summary;
}

function stripMarkdown(text: string) {
  return text
    .replace(/[*_`#>]/g, "")
    .replace(/^[-\s]+/, "")
    .trim();
}

function firstSentence(text: string) {
  const oneLine = text.replace(/\s+/g, " ").trim();
  const sentence = oneLine.split(/(?<=[.!?])\s/)[0]?.trim();

  return sentence || oneLine;
}

function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

function titleFromPrompt(prompt: string) {
  const oneLine = prompt.replace(/\s+/g, " ").trim();
  const withoutInstruction = oneLine.replace(PR_INSTRUCTION_PREFIX, "").trim();
  const withoutQuotes = withoutInstruction.replace(/^["'`]|["'`]$/g, "").trim();

  return withoutQuotes || oneLine;
}

function quote(text: string) {
  return text
    .trim()
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
}

export function buildPrTitle({ prompt, report, type }: PrInput) {
  const branchType = type ?? detectBranchType(prompt);
  const summary = extractSummary(report);
  const title = summary
    ? firstSentence(stripMarkdown(summary))
    : titleFromPrompt(prompt);

  return `${branchType}: ${truncate(title, 68)}`;
}

export function buildPrBody({
  prompt,
  report,
  stat,
  commits,
  branch,
  jobId,
}: PrBodyInput) {
  const summary =
    extractSummary(report) ?? "Automated changes made by the coding agent.";
  const parts: string[] = ["## Summary", summary];

  const changes = (stat ?? "").trim();

  if (changes) {
    parts.push("", "## Changes", "", "```text", changes, "```");
  }

  const commitList = (commits ?? "").trim();

  if (commitList) {
    parts.push("", "## Commits", "", "```text", commitList, "```");
  }

  parts.push("", "## Original task", "", quote(prompt), "");

  const footer = ["Opened automatically by CloudAgent"];

  if (branch) {
    footer.push(`branch \`${branch}\``);
  }

  if (jobId !== undefined) {
    footer.push(`job ${jobId}`);
  }

  parts.push("---", `_${footer.join(" · ")}_`);

  return parts.join("\n");
}
