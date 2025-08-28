import { Router } from "express";

import { createUser, getUsers, loginUser } from "../controllers/user.controller.js";

const userRouter = Router();
userRouter.get("/user", getUsers )
userRouter.post("/register", createUser);
userRouter.post("/login", loginUser);



export default userRouter;