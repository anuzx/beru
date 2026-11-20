import { cors } from "@elysiajs/cors";
import Elysia from "elysia";
import { router } from "./routes";

const trustedOrigins = (process.env.TRUSTED_ORIGINS ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = new Elysia()
  .use(
    cors({
      origin: trustedOrigins,
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .use(router);

app.listen(3000, () => console.log(`server is running at ${app.server?.port}`));