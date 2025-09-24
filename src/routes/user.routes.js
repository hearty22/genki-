import { Router } from "express";

import { createUser, Profile, loginUser, upload, getProfile, deleteProfilePhoto, getUserInstitutions, testInstitutions } from "../controllers/user.controller.js";
import { createInstitution } from "../controllers/inst.controller.js";

const userRouter = Router();


userRouter.post("/register", createUser);
userRouter.post("/login", loginUser);
userRouter.get("/profile", getProfile);
userRouter.post("/profile", upload.single('profile_photo'), Profile);
userRouter.delete("/profile", deleteProfilePhoto);

// Usar controlador temporal para evitar error 500

// Ruta para crear instituciones (necesaria para el frontend)
userRouter.post("/create-institution", createInstitution);

// Ruta de prueba para verificar el modelo
userRouter.get("/test-institutions", testInstitutions);

export default userRouter;

