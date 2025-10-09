import { Router } from "express";
import instRouter from "./inst.routes.js";
import userRouter from "./user.routes.js";

const router = Router();
router.use(userRouter);
router.use(instRouter);


export default router;