export type BranchType =
  | "feat"
  | "fix"
  | "docs"
  | "refactor"
  | "test"
  | "perf"
  | "chore";

const RULES: Array<[BranchType, RegExp]> = [
  ["fix", /\b(fix|bug|broken|error|fail(?:s|ing)?|crash|regression|hotfix)\b/i],
  ["test", /\b(test|tests|spec|coverage)\b/i],
  ["docs", /\b(readme|docs?|documentation|comment|guide|changelog)\b/i],
  ["refactor", /\b(refactor|cleanup|clean up|rename|simplify|restructure)\b/i],
  ["perf", /\b(perf|performance|optimi[sz]e|slow|speed)\b/i],
  ["feat", /\b(add|implement|create|introduce|support|feature|new)\b/i],
  ["chore", /\b(deps?|dependenc(?:y|ies)|bump|upgrade|ci|build|config|lint|chore)\b/i],
];

// Words that only repeat the branch type, so "fix login bug" becomes
// fix/login-<id> instead of fix/fix-login-bug-<id>.
const TYPE_STOP_WORDS: Record<BranchType, Set<string>> = {
  fix: new Set([
    "fix",
    "bug",
    "bugs",
    "broken",
    "error",
    "errors",
    "failing",
    "crash",
    "regression",
    "hotfix",
  ]),
  test: new Set(["test", "tests", "spec", "specs", "coverage"]),
  docs: new Set(["docs", "doc", "documentation"]),
  refactor: new Set(["refactor", "cleanup", "rename", "simplify", "restructure"]),
  perf: new Set(["perf", "performance", "optimize", "optimise", "slow", "speed"]),
  feat: new Set(["feature"]),
  chore: new Set(["chore"]),
};

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "to",
  "for",
  "of",
  "in",
  "on",
  "and",
  "or",
  "with",
  "this",
  "that",
  "please",
  "make",
  "write",
  "add",
  "create",
  "short",
  "saying",
  "pr",
  "pull",
  "request",
]);

export function detectBranchType(prompt: string): BranchType {
  for (const [type, pattern] of RULES) {
    if (pattern.test(prompt)) {
      return type;
    }
  }

  return "chore";
}

export function slugify(prompt: string, maxLength = 40, type?: BranchType) {
  const typeWords = type ? TYPE_STOP_WORDS[type] : undefined;
  const words = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(
      (word) =>
        word && !STOP_WORDS.has(word) && !typeWords?.has(word),
    );

  let slug = "";

  for (const word of words) {
    const nextLength = slug.length === 0 ? word.length : slug.length + 1 + word.length;

    if (nextLength > maxLength) {
      break;
    }

    slug += slug.length === 0 ? word : `-${word}`;
  }

  return slug || "task";
}

export function buildBranchName(prompt: string, jobId: string | number) {
  return `${detectBranchType(prompt)}/${slugify(prompt)}-${jobId}`;
}
