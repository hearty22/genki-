import { Router } from "express";
import {
  createSubject,
  getCourseSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
  assignTeacherToSubject
} from "../controllers/subject.controller.js";
import { authMiddleware } from "../middlewares/auth.js";
import { validator } from "../validators/validator.js";

const subjectRouter = Router();

// Todas las rutas requieren autenticación
subjectRouter.use(authMiddleware);

// Crear una nueva materia (Solo administradores)
subjectRouter.post("/courses/:id/subjects", createSubject);

// Obtener materias de un curso
subjectRouter.get("/courses/:id/subjects", getCourseSubjects);

// Obtener una materia específica
subjectRouter.get("/subjects/:id", getSubjectById);

// Asignar profesor a materia (Solo administradores)
subjectRouter.put("/subjects/:id/assign-teacher", assignTeacherToSubject);

// Actualizar materia (Solo administradores)
subjectRouter.put("/subjects/:id", updateSubject);

// Eliminar materia (Solo administradores)
subjectRouter.delete("/subjects/:id", deleteSubject);

export default subjectRouter;
