import Elysia from "elysia";
import { handleMe, handleSignin, handleSignup } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = new Elysia()
  .post("/signup", handleSignup)
  .post("/signin", handleSignin)
  .use(authMiddleware)
  .get("/me", handleMe);

export default router;