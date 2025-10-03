import { Router } from "express";

import { createUser, Profile, loginUser, upload, getProfile, deleteProfilePhoto, getUserInstitutions, testInstitutions } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.js";
import { createUserValidator, loginUserValidator } from "../validators/user.validations.js";
import { validator } from "../validators/validator.js";
const userRouter = Router();

// Rutas públicas (no requieren autenticación)
userRouter.post("/register", createUserValidator, validator, createUser);
userRouter.post("/login", loginUserValidator, validator, loginUser);

// Rutas protegidas (requieren autenticación)
userRouter.get("/profile", getProfile);
userRouter.post("/profile", upload.single('profile_photo'), Profile);
userRouter.delete("/profile", authMiddleware, deleteProfilePhoto);

userRouter.get("/test-institutions", authMiddleware, testInstitutions);

export default userRouter;
