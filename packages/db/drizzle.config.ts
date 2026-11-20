import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { resolve } from "node:path";

// `import.meta.dirname` is not always available (e.g. when the CLI bundles this config).
const root = import.meta.dirname ?? process.cwd();

loadEnv({ path: resolve(root, ".env") });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Expected it in packages/db/.env");
}

export default defineConfig({
  out: "drizzle",
  schema: resolve(root, "src/db/schema.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
