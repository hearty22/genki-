import { Router } from "express";
import {
  createInstitution,
  getAllInstitutions,
  getInstitutionById,
  updateInstitution,
  deleteInstitution,
  uploadInstitutionLogo,
  searchInstitutions,
  upload
} from "../controllers/inst.controller.js";
import { authMiddleware } from "../middlewares/auth.js";
import { createInstitutionValidator, updateInstitutionValidator, searchInstitutionsValidator } from "../validators/inst.validations.js";
import { validator } from "../validators/validator.js";

const instRouter = Router();

// Todas las rutas de instituciones requieren autenticación
instRouter.use(authMiddleware);

// Crear una nueva institución
instRouter.post("/create-institution", createInstitutionValidator , validator, createInstitution);

// Obtener todas las instituciones del usuario
instRouter.get("/institutions", getAllInstitutions);

// Buscar instituciones por nombre o siglas del usuario
instRouter.get("/institutions/search", searchInstitutionsValidator, validator, searchInstitutions);

// Obtener una institución por ID (solo si pertenece al usuario)
instRouter.get("/institutions/:id", getInstitutionById);

// Actualizar una institución (solo si pertenece al usuario)
instRouter.put("/institutions/:id", updateInstitutionValidator, validator, updateInstitution);

// Subir logo de institución (solo si pertenece al usuario)
instRouter.post("/institutions/:id/logo", upload.single('logo'), uploadInstitutionLogo);

// Eliminar una institución (solo si pertenece al usuario)
instRouter.delete("/institutions/:id", deleteInstitution);

export default instRouter;


