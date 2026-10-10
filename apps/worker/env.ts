function requireEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export const config = Object.freeze({
  ai_api_key: requireEnv("OPENROUTER_API_KEY"),
  model: requireEnv("MODEL") ?? "openrouter/free",
  e2b_api_key: requireEnv("E2B_API_KEY"),
});
