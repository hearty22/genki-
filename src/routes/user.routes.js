import { Router } from "express";

import { createUser,  Profile,  loginUser, upload, getProfile, deleteProfilePhoto, assignInstitutionToUser, removeInstitutionFromUser, getUserInstitutions, testInstitutions } from "../controllers/user.controller.js";
import { getAllInstitutions, createInstitution } from "../controllers/inst.controller.js";

const userRouter = Router();


userRouter.post("/register", createUser);
userRouter.post("/login", loginUser);
userRouter.get("/profile", getProfile);
userRouter.post("/profile", upload.single('profile_photo'), Profile);
userRouter.delete("/profile", deleteProfilePhoto);

// Rutas para instituciones del usuario
userRouter.get("/institutions", getUserInstitutions);
userRouter.post("/institutions", assignInstitutionToUser);
userRouter.delete("/institutions/:institutionId", removeInstitutionFromUser);

// Ruta para obtener todas las instituciones disponibles
userRouter.get("/all-institutions", getAllInstitutions);

// Ruta para crear instituciones (necesaria para el frontend)
userRouter.post("/create-institution", createInstitution);

// Ruta de prueba para verificar el modelo
userRouter.get("/test-institutions", testInstitutions);

export default userRouter;