import { Router } from "express";

import { createUser, getUsers } from "../controllers/user.controllers.js";

const userRouter = Router();
userRouter.get("/user", getUsers )
userRouter.post("/user", createUser);



export default userRouter;