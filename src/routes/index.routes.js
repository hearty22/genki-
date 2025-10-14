import { Router } from "express";
import instRouter from "./inst.routes.js";
import userRouter from "./user.routes.js";
import careerRouter from "./career.routes.js";
import courseRouter from "./course.routes.js";
import subjectRouter from "./subject.routes.js";
import eventRouter from "./event.routes.js";

const router = Router();
router.use(userRouter);
router.use(instRouter);
router.use(careerRouter);
router.use(courseRouter);
router.use(subjectRouter);
router.use(eventRouter);


export default router;