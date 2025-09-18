import { Router } from "express";

import { createUser,  getProfile,  loginUser } from "../controllers/user.controller.js";

const userRouter = Router();


userRouter.post("/register", createUser);
userRouter.post("/login", loginUser);
userRouter.get("/profile", getProfile)


export default userRouter;