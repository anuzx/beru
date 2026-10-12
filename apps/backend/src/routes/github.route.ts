import Elysia from "elysia";
import { handleInstall } from "../controllers/github.controller";

const router = new Elysia().get("/install",handleInstall);



export default router;
