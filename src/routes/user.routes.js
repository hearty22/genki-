import { Router } from "express";

import { createUser, Profile, loginUser, upload, getProfile, deleteProfilePhoto, getUserInstitutions, testInstitutions } from "../controllers/user.controller.js";
import { createInstitution } from "../controllers/inst.controller.js";
import { authMiddleware } from "../middlewares/auth.js";

const userRouter = Router();

// Rutas públicas (no requieren autenticación)
userRouter.post("/register", createUser);
userRouter.post("/login", loginUser);

// Rutas protegidas (requieren autenticación)
userRouter.get("/profile", getProfile);
userRouter.post("/profile", upload.single('profile_photo'), Profile);
userRouter.delete("/profile", authMiddleware, deleteProfilePhoto);
userRouter.get("/institutions", getUserInstitutions);
userRouter.post("/create-institution", authMiddleware, createInstitution);
userRouter.get("/test-institutions", authMiddleware, testInstitutions);

export default userRouter;

