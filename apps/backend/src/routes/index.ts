import Elysia from "elysia";
import authRouter from "./auth.route";
import githubRouter from "./github.route";
import chatRouter from "./task.route"

export const router = new Elysia({ prefix: "/api/v1" })
  .use(new Elysia({ prefix: "/auth" })).use(authRouter)
  .use(new Elysia({ prefix: "/github" })).use(githubRouter)
  .use(new Elysia({prefix: "/tasks"})).use(chatRouter)

