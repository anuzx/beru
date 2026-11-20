import Elysia from "elysia";
import githubRouter from "./github.route";
import taskRouter from "./task.route";
import authRouter from "./auth.route";

export const router = new Elysia({ prefix: "/api/v1" })
  .use(new Elysia({ prefix: "/auth" }).use(authRouter))
  .use(new Elysia({ prefix: "/github" }).use(githubRouter))
  .use(new Elysia({ prefix: "/tasks" }).use(taskRouter));
