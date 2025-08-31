import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../middlewares/auth.js";
const upload = multer({dest:"uploads/"})
import { createUser, getUsers, loginUser, uploadProfile } from "../controllers/user.controller.js";

const userRouter = Router();


userRouter.post("/profile", authMiddleware ,upload.single("profilePicture"), uploadProfile)
userRouter.get("/user", getUsers )
userRouter.post("/register", createUser);
userRouter.post("/login", loginUser);



export default userRouter;