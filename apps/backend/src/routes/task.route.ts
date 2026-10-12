import Elysia from "elysia";
import { handleQuery } from "../controllers/task.controller";

const router = new Elysia().post("/", handleQuery);

export default router;
