import { OpenRouter } from "@openrouter/sdk";
import type { GitHubAppConfig } from "@repo/github";
import { config } from "./env";

export const openRouter = new OpenRouter({
  apiKey: config.ai_api_key,
});

let cachedApp: Promise<GitHubAppConfig> | undefined;

export function loadGithubApp(): Promise<GitHubAppConfig> {
  cachedApp ??= Bun.file(config.github_app_private_key_path)
    .text()
    .then((privateKey) => ({ appId: config.github_app_id, privateKey }));

  return cachedApp;
}
