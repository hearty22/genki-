import { Router } from "express";

import { createUser,  Profile,  loginUser, upload, getProfile, deleteProfilePhoto } from "../controllers/user.controller.js";

const userRouter = Router();


userRouter.post("/register", createUser);
userRouter.post("/login", loginUser);
userRouter.get("/profile", getProfile);
userRouter.post("/profile", upload.single('profile_photo'), Profile);
userRouter.delete("/profile", deleteProfilePhoto);


export default userRouter;