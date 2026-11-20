import Elysia from "elysia";
import { handleInstall } from "../controllers/github.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = new Elysia().use(authMiddleware).post("/install", handleInstall);

export default router;