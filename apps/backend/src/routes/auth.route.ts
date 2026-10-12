import Elysia from "elysia";
import { handleSignin, handleSignup } from "../controllers/auth.controller";

const router = new Elysia()
  .post("/signup", handleSignup)
  .post("/signin", handleSignin);

export default router;
