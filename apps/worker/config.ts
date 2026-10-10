import { OpenRouter } from "@openrouter/sdk";
import { config } from "./env";

export const openRouter = new OpenRouter({
  apiKey: config.ai_api_key,
});