import { Router } from "express";
import {
  createCareer,
  getInstitutionCareers,
  getCareerById,
  updateCareer,
  deleteCareer
} from "../controllers/career.controller.js";
import { authMiddleware, isAdmin } from "../middlewares/auth.js";
import { validator } from "../validators/validator.js";

const careerRouter = Router();

// Todas las rutas requieren autenticación
careerRouter.use(authMiddleware);

// Crear una nueva carrera (Solo administradores)
careerRouter.post("/institutions/:id/careers", isAdmin, createCareer);

// Obtener carreras de una institución
careerRouter.get("/institutions/:id/careers", getInstitutionCareers);

// Obtener una carrera específica
careerRouter.get("/careers/:id", getCareerById);

// Actualizar carrera (Solo administradores)
careerRouter.put("/careers/:id", isAdmin, updateCareer);

// Eliminar carrera (Solo administradores)
careerRouter.delete("/careers/:id", isAdmin, deleteCareer);

export default careerRouter;
